import socket
import sys
import json
from static.client.client_socket import *


connection = Connection()
bandera = False


def run_client_connection():
    connection.run_connection()
    bandera = True
    
def executor(action):
    json_code = json.dumps(action)
    dict_data = eval(json_code)
    json_data = json.loads(dict_data)
    global bandera
    print("Conexión Establecida: ", bandera)
    if bandera:
        try:
        
            if 'action' in json_data:

                print("Detener Emulacion")
                message = json_code
                connection.send_message(message)
                print('Mensaje Enviado: ', json_data)
                data_server = connection.recive_message()
                print(type(data_server))
                answer_server = data_server.decode()
                dict_data_server = eval(answer_server)
                json_data_server = json.dumps(dict_data_server)
                print('Servidor: {!r}'.format(json_data_server))
                bandera = False
                return eval(json_data_server)
                
            else:

                message = json_code
                connection.send_message(message)
                print('Mensaje Enviado: ', json_data)
                data_server = connection.recive_message()
                print(type(data_server))

                answer_server = data_server.decode()
                dict_data_server = eval(answer_server)
                json_data_server = json.dumps(dict_data_server)
                print('Servidor: {!r}'.format(json_data_server))
                return eval(json_data_server)
        finally:
            
            if bandera == False:
                connection.stop_connection()
                
            else:
                print("Conexión sigue Habilitada")
                pass
    else:
        try:
            run_client_connection()
            message = json_code
            connection.send_message(message)
            print('Mensaje Enviado: ', json_data)
            data_server = connection.recive_message() 
            answer_server = data_server.decode()
            dict_data_server = eval(answer_server)
            json_data_server = json.dumps(dict_data_server)
            print('Servidor: {!r}'.format(json_data_server))
            bandera = True
            return eval(json_data_server)
        finally:
            pass