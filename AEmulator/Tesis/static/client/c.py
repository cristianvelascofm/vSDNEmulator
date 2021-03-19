import socket
import sys
import json
from static.client.client_socket import *
import ast

def executor(action):

    json_code = json.dumps(action)
    dict_data = eval(json_code)
    json_data = json.loads(dict_data)

    try:
        connection = Connection()
        connection.run_connection()
        print('Conexcion Establecida')
        
        message = json_code
        m = 'Hello World'
        print('Longitud Bytes',len(m.encode()))
        connection.send_message(message)
        print('Mensaje Enviado: ', json_data)
        data_server = connection.recive_message()
        #print('Data server',data_server_b[0])
        #data_server = ast.literal_eval(data_server_b[0])
        
        answer_server = data_server.decode('utf-8')
        #answer_server = data_server_b[0].decode()
        dict_data_server = eval(answer_server)
        json_data_server = json.dumps(dict_data_server)
        print('Servidor: {!r}'.format(json_data_server))
        return eval(json_data_server)

    except socket.error as m:

        print('Error al Conectar ',m)
        json_data_server = {}
        json_data_server['State:'] = 'False'
        return json_data_server

    finally:
        print('Cerrando')
        connection.stop_connection()