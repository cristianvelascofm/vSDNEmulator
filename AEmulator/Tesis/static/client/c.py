import socket
import sys
import json
from static.client.client_socket import *


def executor(action):

    json_code = json.dumps(action)
    dict_data = eval(json_code)
    json_data = json.loads(dict_data)

    try:
        connection = Connection()
        connection.run_connection()
        print('Conexcion Establecida')
        
        message = json_code
        connection.send_message(message)
        print('Mensaje Enviado: ', json_data)
        data_server = connection.recive_message() 
        answer_server = data_server.decode()
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