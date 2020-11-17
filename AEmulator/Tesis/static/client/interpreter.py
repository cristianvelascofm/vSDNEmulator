import json



hostElement = []
switchElement = []
controllerElement = []


def decoded_data(data):
    decoded = json.loads(data)

    if decoded['id'] [0] == 'h':
        print ("Host: ", decoded['id'])
        