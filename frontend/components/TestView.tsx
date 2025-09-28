import React, { useState, useEffect } from 'react';
import type { Endpoint } from '../types';

// Augment the Window interface to include PyScript
declare global {
    interface Window {
        pyscript: any;
    }
}

interface TestViewProps {
  code: string | null;
  endpoint: Endpoint | null;
  isGeneratingCode: boolean;
}

const TestView: React.FC<TestViewProps> = ({ code, endpoint, isGeneratingCode }) => {
  const [editableCode, setEditableCode] = useState('');
  const [testOutput, setTestOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyscriptReady, setPyscriptReady] = useState(false);

  useEffect(() => {
    if (!isGeneratingCode) {
        setEditableCode(code || '# No endpoint selected. Please select or create an endpoint to test.');
    }
  }, [code, isGeneratingCode]);

  useEffect(() => {
    const handlePyScriptReady = () => {
      setPyscriptReady(true);
    };

    if (window.pyscript) {
      handlePyScriptReady();
    } else {
      window.addEventListener('py:ready', handlePyScriptReady);
    }

    return () => {
      window.removeEventListener('py:ready', handlePyScriptReady);
    };
  }, []);

  const handleRunTest = async () => {
    if (isRunning || !code || !endpoint || !pyscriptReady) return;

    setIsRunning(true);
    setTestOutput('Running test...');

    const functionName = `${endpoint.method.toLowerCase()}_${endpoint.path
      .replace(/[\/:-?]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')}`;

    const pathParams = endpoint.queryParams.map(p => p.name.trim()).filter(Boolean);
    const mockArgs = pathParams.map(p => `"${p}_test_value"`).join(', ');

    const testHarness = `
import io
import sys
import json
import traceback

old_stdout = sys.stdout
sys.stdout = captured_output = io.StringIO()

class MockRequest:
    def get_json(self):
        body = {
            ${endpoint.bodyParams.map(p => `"${p.name}": "test_${p.name}"`).join(',\n            ')}
        }
        return body

    @property
    def args(self):
        return {}

request = MockRequest()

def jsonify(data):
    if isinstance(data, tuple):
        return json.dumps(data[0], indent=2)
    return json.dumps(data, indent=2)

${editableCode}

try:
    print("--- Calling function: ${functionName}(${mockArgs}) ---")
    result_tuple = ${functionName}(${mockArgs})
    
    if isinstance(result_tuple, tuple):
        result, status_code = result_tuple
        print(f"\\n--- [Execution Result | Status: {status_code}] ---")
        try:
            parsed_json = json.loads(result)
            print(json.dumps(parsed_json, indent=2))
        except:
            print(result)
    else:
        print("\\n--- [Execution Result] ---")
        print(result_tuple)

except Exception as e:
    print("\\n--- [Execution Error] ---")
    traceback.print_exc()
finally:
    sys.stdout = old_stdout

captured_output.getvalue()
`;
    
    try {
        const result = await window.pyscript.interpreter.run(testHarness);
        setTestOutput(result || 'Execution finished with no output.');
    } catch (error: any) {
        setTestOutput(`An error occurred while running PyScript:\n${error.message}`);
    } finally {
        setIsRunning(false);
    }
  };

  const renderContent = () => {
    if (isGeneratingCode) {
        return (
             <div className="flex items-center justify-center h-full text-gray-500 py-10">
                <svg className="animate-spin h-5 w-5 mr-3 text-indigo-500" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Waiting for AI code generation to complete...</span>
            </div>
        )
    }

    if (code) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="font-semibold text-gray-700">Editable Codebase</h3>
                     <button
                        onClick={handleRunTest}
                        disabled={isRunning || !pyscriptReady}
                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                     >
                        {!pyscriptReady ? 'Initializing Engine...' : isRunning ? 'Running...' : 'Run Test'}
                     </button>
                  </div>
                  <textarea
                    value={editableCode}
                    onChange={(e) => setEditableCode(e.target.value)}
                    className="w-full h-[500px] p-4 bg-gray-800 text-white font-mono text-sm rounded-lg border border-gray-700 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    spellCheck="false"
                  />
                </div>
                <div>
                   <h3 className="font-semibold text-gray-700 mb-2">Live Output</h3>
                   <div className="w-full h-[500px] p-4 bg-black text-green-400 font-mono text-xs rounded-lg overflow-y-auto whitespace-pre-wrap">
                      {testOutput ? testOutput : <span className="text-gray-500">Click "Run Test" to see the output.</span>}
                   </div>
                </div>
            </div>
        );
    }

    return <p className="text-center text-gray-500 py-4">No active endpoint to test. Please create or select an endpoint from the 'ENDPOINT' tab.</p>
  }

  return (
    <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Test Endpoint</h2>
      {renderContent()}
    </div>
  );
};

export default TestView;
