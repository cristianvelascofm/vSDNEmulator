from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.generic import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from static.client.client import executor


class emulationView(View):


    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = request.body
        #print(data.decode(encoding='utf-8'))
        executor(data.decode(encoding='utf-8'))
        return JsonResponse({'Mensaje': 'Información Enviada al Servidor'})

    def get(self, request, *args, **kwargs):
        #return JsonResponse({'que contas': 'nada'})
        return render(request, 'alambric_emulator.html')


