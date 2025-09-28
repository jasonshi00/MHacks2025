from flask import Flask, jsonify, request
import psycopg2
import json

app = Flask(__name__)

conn = psycopg2.connect(database="mhacks2025", 
                        user="postgres",
                        password="1234", 
                        host="localhost", port="5432")
cur = conn.cursor()

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/component', methods = ['GET', 'POST'])
def component():
    if(request.method == 'GET'):
        sql_query = '''SELECT * FROM component'''
        cur.execute(sql_query)
        data = cur.fetchall()
        return jsonify({'data': data})
    
    elif(request.method == "POST"):
        route = request.form.get('route')
        method = request.form.get('method')
        service = request.form.get('service')
        description = request.form.get('description')
        sql_query = '''INSERT INTO component \
        (route, method, service, description) VALUES (%s, %s, %s, %s)'''

        cur.execute(sql_query, (route, method, service, description))
        conn.commit()
        return jsonify({"message": "200"}), 200

@app.route("/component/<int:id>")
def component_id(id):
    sql_query = '''SELECT * FROM component \
                   WHERE component_id = %s'''
    
    cur.execute(sql_query, (id, ))
    data = cur.fetchall()
    return jsonify({'data': data})

@app.route("/service", methods = ['GET', 'POST'])
def service():
    if(request.method == 'GET'):
        sql_query = '''SELECT * FROM service'''
        cur.execute(sql_query)
        data = cur.fetchall()
        return jsonify({'data': data})
    
    elif(request.method == "POST"):
        parent_component = request.form.get("parent_component")
        if (request.form.get("parent_component") == ""):
            parent_component = None
        name = request.form['name']
        sql_query = '''INSERT INTO service \
        (parent_component, name) VALUES (%s, %s)'''

        cur.execute(sql_query, (parent_component, name))
        conn.commit()
        return jsonify({}), 200
    
# @app.route("/userDB", methods = ['GET', 'POST'])
# def userDB():
#     if(request.method == 'GET'):
#         sql_query = '''SELECT * FROM userDB'''
#         cur.execute(sql_query)
#         data = cur.fetchall()
#         return jsonify({'data': data})
    
#     elif(request.method == "POST"):
#         conn_str = request.form.get("conn_str")
#         port = request.form.get("port")
        
#         sql_query = '''INSERT INTO userDB \
#         (conn, port) VALUES (%s, %s)'''

#         cur.execute(sql_query, (conn_str, port))
#         conn.commit()
#         return jsonify({}), 200
    

@app.route("/init", methods = ['POST'])
def init():
    # database = request.form.get("database")
    # user = request.form.get("user")
    # password = request.form.get("password")
    # host = request.form.get("host")
    # port = request.form.get("port")
    
    # sql_query = '''INSERT INTO userDB \
    # (database, user, password, host, port) VALUES (%s, %s)'''

    # cur.execute(sql_query, (conn_str, port))
    # conn.commit()

    userConn = psycopg2.connect(database="userdb", 
                        user="postgres",
                        password="1234", 
                        host="localhost", port="5432")
    userCur = userConn.cursor()
    sql_query = """
            SELECT
                table_name,
                column_name,
                data_type
            FROM
                information_schema.columns
            WHERE
                table_schema = 'public'
            ORDER BY
                table_name,
                ordinal_position;
        """
    userCur.execute(sql_query)
    rows = userCur.fetchall()
    schemas = {}
    for table, column, dtype in rows:
        if table not in schemas:
            schemas[table] = {}
        schemas[table][column] = dtype

    # 4. For each table, perform a single UPSERT operation.
    # This will INSERT a new row, or if the table_name already exists,
    # it will UPDATE the attributes column by replacing the old JSON object.
    for table_name, attributes_dict in schemas.items():
        # Convert the Python dictionary to a JSON string
        attributes_json = json.dumps(attributes_dict)

        upsert_query = """
            INSERT INTO DBschema (service_id, table_name, attributes)
            VALUES (%s, %s, %s)
        """
        # In the UPDATE clause, EXCLUDED.attributes refers to the
        # attributes value we tried to insert (the new, complete JSON object).
        cur.execute(upsert_query, (None, table_name, attributes_json))

    conn.commit() # Commit once after all operations are done

    return jsonify({"message": "Schema initialized successfully!", "schemas_processed": schemas})


