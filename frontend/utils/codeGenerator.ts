import { GoogleGenAI } from "@google/genai";
import type { Endpoint, Service } from '../types';

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

export const generateFlaskCode = async (endpoint: Endpoint, services: Service[]): Promise<string> => {
  const service = services.find(s => s.id === endpoint.serviceId);
  const functionName = `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[\/:-?]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')}`;
  const pathParams = endpoint.queryParams.map(p => p.name.trim());
  let flaskPath = endpoint.path;
  pathParams.forEach(param => {
    flaskPath = flaskPath.replace(`/:${param}?`, `/<${param}>`).replace(`/:${param}`, `/<${param}>`);
  });
  const functionArgs = endpoint.queryParams.map(p => p.optional ? `${p.name}=None` : p.name).join(', ');
  const docstring = endpoint.description ? endpoint.description.trim().replace(/\n/g, '\n    ') : `Endpoint to ${endpoint.method} data for path: ${endpoint.path}`;

  let logicAndReturnBlock = `
    # --- Your logic here ---
    
    # Example response:
    response_data = {
        'message': 'Endpoint executed successfully!',
        'method': '${endpoint.method}',
        'path': '${endpoint.path}',
        'received_path_params': {
            ${pathParams.filter(p => p).map(p => `'${p}': ${p}`).join(',\n            ')}
        }
    }
    return jsonify(response_data), 200`;

  if (ai && endpoint.description) {
    const prompt = `You are an expert Python developer specializing in the Flask web framework. Your task is to write the Python code for the body of a Flask route function based on a given specification.

**Instructions:**
1.  ONLY provide the Python code for the function's inner logic.
2.  DO NOT include the function definition line (e.g., \`def function_name():\`).
3.  You MUST prepare a dictionary variable named \`response_data\` with the final data to be sent.
4.  DO NOT include the final \`return jsonify(response_data), 200\` statement. I will add that myself.
5.  Assume path parameters (e.g., \`${pathParams.join(', ')}\`) are available as variables with the same name.
6.  If body parameters are specified (e.g., \`${endpoint.bodyParams.map(p => p.name).join(', ')}\`), assume they have been extracted from a JSON payload into a dictionary named \`data\`. You can access them like \`data.get('param_name')\`.
7.  Focus on implementing the logic described by the user.

**Endpoint Specification:**
*   **Description:** "${endpoint.description}"
*   **HTTP Method:** ${endpoint.method}
*   **Path:** ${flaskPath}

Now, generate the Python code for the specification above.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              temperature: 0.2,
            }
        });
        const aiGeneratedCode = response.text.replace(/```python|```/g, '').trim();
        logicAndReturnBlock = `
    # --- AI Generated Logic ---
${aiGeneratedCode.split('\n').map(line => `    ${line}`).join('\n')}

    # Assuming 'response_data' was prepared by the AI as instructed.
    return jsonify(response_data), 200`;
    } catch (e) {
        console.error("Error generating code with AI:", e);
        const errorMessage = e instanceof Error ? e.message : String(e);
        logicAndReturnBlock = `
    # --- AI Generation Failed ---
    # Error: ${errorMessage.replace(/\n/g, ' ')}
    response_data = {'error': 'AI code generation failed.'}
    return jsonify(response_data), 500`;
    }
  }

  let fullCode = `from flask import Flask, request, jsonify

app = Flask(__name__)

# --- Generated Endpoint ---

@app.route('${flaskPath}', methods=['${endpoint.method}'])
def ${functionName}(${functionArgs}):
    """
    ${docstring}
    """
`;

  if (service) {
    fullCode += `
    # Service associated: ${service.name} (Schema: ${service.schema})
    # TODO: Implement your service logic here using the '${service.name}' service.
`;
  }
  
  if (endpoint.bodyParams.length > 0) {
      fullCode += `
    # Accessing body parameters (assuming JSON payload):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing JSON payload'}), 400
        # You can now access body params like: data.get('param_name')
    except Exception as e:
        return jsonify({'error': 'Invalid JSON format'}), 400
`;
  }
  
  fullCode += logicAndReturnBlock;
  fullCode += `

# --- End of Generated Endpoint ---`;

  return fullCode;
};
