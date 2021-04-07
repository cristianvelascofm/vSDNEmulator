import socket
import sys
import json
import time
import struct


class Connection():
    def __init__(self):
        self.__sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # self.__server_adress = ('192.168.56.102', 10000)
        self.__server_adress = ('10.55.6.188', 10000)
        #self.__cache = 999000000    
        self.__cache = 65000    

    def run_connection(self):
        print('Conectándose a {} puerto {}'.format(*self.__server_adress))
        self.__sock.connect(self.__server_adress)
    
    def send_message(self, msj):
        self.__sock.sendall(msj.encode())
    
    def stop_connection(self):
        self.__sock.close() 
    
    def recive_message(self):
        part = self.__sock.recv(self.__cache)
        data = b''
        if part:
            data += part
        else:
            print('No hay más datos')
            
        return data
    
    def recive_message_new(self, timeout=2):
        self.__sock.setblocking(False)

        total_data= []
        data = ''
        begin = time.time()
        

        while 1:
            if total_data and time.time() - begin > timeout:
                break

            elif time.time() - begin > timeout*2:
                break
            
            try:
                data = self.__sock.recv(self.__cache)
                if data:
                    total_data.append(data)
                    begin= time.time()
                else:
                    time.sleep(0.1)
            except:
                #print('excepcion')
                pass
        return total_data