DB = 'LAB_IFA_CC_QA'
USUARIO = 'manager'
CLAVE = '7890uiXX'
DATE = ''

import tkinter as tk
import requests
import pandas as pd
import numpy as np
import json
import time
import os
import warnings
from urllib3.exceptions import InsecureRequestWarning
from hdbcli import dbapi
import sys
# Silenciar advertencias de solicitudes no verificadas
warnings.simplefilter('ignore', InsecureRequestWarning)



# Capturar el argumento
if len(sys.argv) > 1:
    mi_variable = sys.argv[1]  # Obtiene el primer argumento después del nombre del script
    print("")
    print(f"Fecha de operacion: {mi_variable}")
    DATE = mi_variable

else:
    print("No se recibió ninguna variable")



def borrar_logs():
    with open('src/apps/ccMigration/logs.json', 'w') as file:
        json.dump([], file, indent=4)
    with open('src/apps/ccMigration/error.json', 'w') as file:
        json.dump([], file, indent=4)
    print('')
    #print('--------------------------------')
    print(f'-logs borrados')
    print('')
    print('')


# Ejemplo de uso
borrar_logs()

def guardar_en_logs(mensaje, archivo='src/apps/ccMigration/logs.json'):
    # Verificar si el archivo ya existe
    if os.path.exists(archivo):
        # Leer el contenido existente
        with open(archivo, 'r') as file:
            logs = json.load(file)
    else:
        logs = []

    # Agregar el nuevo mensaje a los logs
    logs.append({"mensaje": mensaje})

    # Escribir los logs actualizados al archivo JSON
    with open(archivo, 'w') as file:
        json.dump(logs, file, indent=4)

def guardar_en_error(mensaje, archivo='src/apps/ccMigration/error.json'):
    # Verificar si el archivo ya existe
    if os.path.exists(archivo):
        # Leer el contenido existente
        with open(archivo, 'r') as file:
            logs = json.load(file)
    else:
        logs = []

    # Agregar el nuevo mensaje a los logs
    logs.append({"mensaje": mensaje})

    # Escribir los logs actualizados al archivo JSON
    with open(archivo, 'w') as file:
        json.dump(logs, file, indent=4)

# Función para obtener datos
def obtener_datos():
    # Conexión a SAP HANA
    conn = dbapi.connect(
        address="172.16.11.25",
        port=30015,
        user="B1ADMIN",
        password="Inotecra770**"
    )

    # Consulta SQL

    # Ejemplo de DataFrame

    sql = f"""


SELECT
    *
FROM
    LAB_IFA_PRD.IFA_SIS_DATA_CC_MIGRATION T0
WHERE
    concat('',T0."TransId") NOT IN (SELECT ifnull(concat('',"Ref3"),0) FROM "{DB}"."OJDT" union all SELECT ifnull(concat('',"Ref3"),0) FROM "{DB}"."OBTF")
    AND T0."RefDate" >= '{DATE}'
    AND T0."RefDate" <= '{DATE}'
    AND T0."TransType" in (13,30)
    ;

            """
    
    count = f"""


SELECT 
    count(T0."TransId") "count"
FROM
    "LAB_IFA_PRD"."OJDT" T0
WHERE
    concat('',T0."TransId") NOT IN (SELECT ifnull(concat('',"Ref3"),0) FROM "{DB}"."OJDT" union all SELECT ifnull(concat('',"Ref3"),0) FROM "{DB}"."OBTF")
    AND T0."RefDate" >= '{DATE}'
    AND T0."RefDate" <= '{DATE}'
    AND T0."TransType" in (13,30)
        ;





            """

    # Ejecutar consulta
    cursor = conn.cursor()
    cursor.execute(sql)

    # Recoger los datos en un DataFrame de pandas
    columns = [desc[0] for desc in cursor.description]
    datos = pd.DataFrame(cursor.fetchall(), columns=columns)
    
    cursor.execute(count)
    columns = [desc[0] for desc in cursor.description]
    lineas = pd.DataFrame(cursor.fetchall(), columns=columns)
    print(lineas['count'].iloc[0], ' registros.')

    # Cerrar la conexión
    cursor.close()
    conn.close()

    return datos

# Función para clasificar datos
def clasificar_datos(df):

    # Limpiando datos
    df['TransType'] = df['TransType'].astype('int64') 

    # Clasificando datos
    df['SchemaType'] = np.select(
        [
            df['TransType'] == 13,
            df['TransType'] == 14,
            df['TransType'] == 15,
            df['TransType'] == 16,
            df['TransType'] == 18,
            df['TransType'] == 19,
            df['TransType'] == 20,
            df['TransType'] == 21,
            df['TransType'] == 24,
            df['TransType'] == 25,
            df['TransType'] == 30,
            df['TransType'] == 46,
            df['TransType'] == 59,
            df['TransType'] == 60,
            df['TransType'] == 67,
            df['TransType'] == 69,
            df['TransType'] == 162,
            df['TransType'] == 321,
            df['TransType'] == 1
        ],
        [
            'facturaVen', 'notaCreditoVen', 'entregaVen', 'devolucionesVen', 
            'facturaCom', 'notaCreditoCom', 'entradasCom', 'devolucionesCom',
            'cobros', 'depModulo', 'asiento', 'pagos',
            'entradasInv', 'salidasInv', 'transferencias', 'costeo',
            'revalorizacion', 'reconciliacion', 'otro'
        ],
        default='sin schema'
    )

    # Clasificando datos
    df['Automatique'] = np.select(
        [
            df['TransType'] == 13,
            df['TransType'] == 14,
            df['TransType'] == 15,
            df['TransType'] == 16,
            df['TransType'] == 18,
            df['TransType'] == 19,
            df['TransType'] == 20,
            df['TransType'] == 21,
            df['TransType'] == 24,
            df['TransType'] == 25,
            df['TransType'] == 30,
            df['TransType'] == 46,
            df['TransType'] == 59,
            df['TransType'] == 60,
            df['TransType'] == 67,
            df['TransType'] == 69,
            df['TransType'] == 162,
            df['TransType'] == 321,
            df['TransType'] == 1
        ],
        [
            'auto', 'auto', 'auto', 'auto', 
            'auto', 'auto', 'auto', 'auto',
            'auto', 'auto', 'prelim', 'auto',
            'auto', 'auto', 'auto', 'auto',
            'auto', 'auto', 'auto'
        ],
        default='prelim'
    )
    #print('clasificados exitosa.')
    
    return df

# Función para formatear datos
def formatear_datos_auto(datos):

    def schema_facturaVen(group):


        # Crear la entrada del JournalEntry
        journal_entry = {
            "ReferenceDate": group['RefDate'].iloc[0].strftime('%Y-%m-%d'),
            "DueDate": group['DueDate'].iloc[0],
            #"Memo": "SCZ(REMBERTO GUTIERREZ MORON):DESEMBOLSO DE FONDOS VARIOS AUTORIZADO POR EL DIRECTORIO SG COM INT ADJ",
            #"Reference": "",
            #"Reference2": "",
            #"TransactionCode": "",
            "Reference3": group['TransId'].iloc[0],
            #"U_TransIdPrd": group['TransId'].iloc[0],
            "JournalEntryLines": []
        }

        # Agregar las líneas de JournalEntryLines
        for _, row in group.iterrows():
            journal_entry['JournalEntryLines'].append({
                "AccountCode": row['Account'],
                "ShortName": row['ShortName'],
                "Credit": row['Credit'],
                "Debit": row['Debit'],
                #"FCDebit": 0.0,
                #"FCCredit": 0.0,
                #"ContraAccount": "1110606",
                "LineMemo": row['LineMemo']
                #"ReferenceDate1": "2024-09-02",
                #"ReferenceDate2": null,
                #"Reference1": "",
                #"Reference2": "",     
            })

        # Obtener el payload
        #print(journal_entry)
        #print(group)
        #print('time')
        #time.sleep(100)  
        return journal_entry

    grouped = datos.groupby('TransId')

    for trans_id, group in grouped:
        #print(group['SchemaType'].iloc[0])
        if group['SchemaType'].iloc[0] == 'facturaVen':
            datos_formateados = schema_facturaVen(datos)
            return datos_formateados

def formatear_datos_prelim(datos):

    def schema_journal_voucher(group):


        # Crear la entrada del JournalEntry
        journal_entry = {
            "ReferenceDate": group['RefDate'].iloc[0].strftime('%Y-%m-%d'),
            "DueDate": group['DueDate'].iloc[0],
            "Memo": group['Memo'].iloc[0],
            #"Reference": "",
            #"Reference2": "",
            #"TransactionCode": "",
            "Reference3": group['TransId'].iloc[0],
            #"U_TransIdPrd": group['TransId'].iloc[0],
            "JournalEntryLines": []
        }

        # Agregar las líneas de JournalEntryLines
        for _, row in group.iterrows():
            journal_entry['JournalEntryLines'].append({
                "AccountCode": row['Account'],
                "ShortName": row['ShortName'],
                "Credit": row['Credit'],
                "Debit": row['Debit'],
                #"FCDebit": 0.0,
                #"FCCredit": 0.0,
                #"ContraAccount": "1110606",
                "LineMemo": row['LineMemo']
                #"ReferenceDate1": "2024-09-02",
                #"ReferenceDate2": null,
                #"Reference1": "",
                #"Reference2": "",     
            })

        # Crear la estructura final para cada TransId
        json_data = [{
            "JournalVoucher": {
                "JournalEntry": journal_entry
            }
        }]

        # Obtener el payload
        #print(json_data[0])
        #print(group)
        #print('time')
        #time.sleep(100)  
        return json_data[0]

    grouped = datos.groupby('TransId')

    for trans_id, group in grouped:
        if group['SchemaType'].iloc[0] == 'asiento':
            datos_formateados = schema_journal_voucher(datos)
            return datos_formateados

# Función para enviar datos a una API
def enviar_datos_api(datos):
    msj = ''
    errors = 0
    success = 0

    # Configuración de la sesión
    session = requests.Session()
    url_login = 'https://srvhana:50000/b1s/v1/Login'
    headers = {"Content-Type": "application/json; charset=utf-8"}

    # Datos de autenticación
    access = {
        'CompanyDB': DB,
        'UserName': USUARIO,
        'Password': CLAVE
    }


    try:
        # Realizar la solicitud POST para autenticarse
        response_login = session.post(url_login, json=access, verify=False, headers=headers)
        response_login.raise_for_status()  # Verificar si hubo errores en la solicitud

        # Comprobar si la autenticación fue exitosa
        if response_login.status_code == 200:
            #print('\n\nConexión exitosa a la base de datos de centro de costos SAP.\n\n')
            #print('')
            #print('')
            #print('--------------------------------------------------------------------')

            # Obtener el token de sesión
            session_token = response_login.json().get('SessionId')

            if not session_token:
                raise ValueError('No se pudo obtener el token de sesión.')

            # Establecer el token en los encabezados para las siguientes solicitudes
            session.headers.update({'Cookie': f'B1SESSION={session_token}'})


            # Ejemplo de DataFrame
            df = datos.copy()

            # Crear la estructura JSON según el esquema
            json_data = []

            # Agrupar por 'TransId'
            grouped = df.groupby('TransId')


            for trans_id, group in grouped:
                url_add_journal_voucher = ''
                payload = {}

                procesamiento = group['Automatique'].iloc[0]
                #print(trans_id)
                #print(group)
                #print(procesamiento)

                if procesamiento == 'auto':
                    payload = formatear_datos_auto(group)
                    # URL para agregar un Journal Entry
                    url_add_journal_voucher = 'https://srvhana:50000/b1s/v1/JournalEntries'

                elif procesamiento == 'prelim':
                    payload = formatear_datos_prelim(group)
                    # URL para agregar un Journal Voucher preliminar
                    url_add_journal_voucher = 'https://srvhana:50000/b1s/v1/JournalVouchersService_Add'


                # Realizar la solicitud POST usando la sesión y el payload
                try:
                    response_post = session.post(url_add_journal_voucher, json=payload, verify=False, headers=headers)
                    response_post.raise_for_status()  # Verificar si hubo errores en la solicitud

                    # Verificar el código de estado de la respuesta
                    if response_post.status_code in [200, 201, 204]:

                        msj = f'Exito: {response_post.status_code} - TransId # {trans_id} agregado'
                        success += 1
                        #print(msj)
                        guardar_en_logs(msj)
                    else:
                        # Intentar imprimir la respuesta JSON
                        try:
                            response_json = response_post.json()
                            #msj = f'Error: {response_post.status_code} - JSON Response: {response_json}'
                            error_message = response_json.get('error', {}).get('message', {}).get('value', 'No message')
                            msj = f"Error TransId #{trans_id}: {error_message}"
                            errors += 1


                            #print(msj)
                            guardar_en_error(msj)
                        except ValueError:
                            msj = f'Error TransId #{trans_id}: No JSON response or invalid JSON'
                            errors += 1

                            print(msj)
                            guardar_en_error(msj)
                except requests.exceptions.RequestException as e:
                    # Intentar imprimir la respuesta JSON
                    try:
                        response_json = response_post.json()
                        #msj = f'Error: {response_post.status_code} - JSON Response: {response_json}'
                        error_message = response_json.get('error', {}).get('message', {}).get('value', 'No message')
                        msj = f"Error TransId #{trans_id}: {error_message}"
                        errors += 1

                        #print(msj)
                        guardar_en_error(msj)

                    except ValueError:
                        msj = f'Error TransId #{trans_id}: No JSON response or invalid JSON'
                        errors += 1

                        #print(msj)
                        guardar_en_error(msj)

                json_data = []

            print('')
            print(f'cargados: {success} ')
            print(f'errores: {errors} ')


        else:
            msj = f'Error en la conexión a la base de datos de centro de costos SAP: {response_login.status_code} - Detalles: {response_login.text}'
            #print(msj)
            guardar_en_error(msj)


    except requests.exceptions.HTTPError as http_err:
        msj = f'Error HTTP: {http_err}'
        #print(msj)
        guardar_en_error(msj)

    except requests.exceptions.RequestException as req_err:
        msj = f'Error en la solicitud: {req_err}'
        #print(msj)
        guardar_en_error(msj)

    except ValueError as val_err:
        msj = f'Error en la respuesta: {val_err}'
        #print(msj)
        guardar_en_error(msj)


# Función para manejar el flujo completo y ejecutar
def ejecutar_proceso():
    datos = obtener_datos()  
    datos_clasificados = clasificar_datos(datos)  
    enviar_datos_api(datos_clasificados)
    print('\n- Proceso concluido')
    print('\n>>>>>>>>>>>>>>>>>>>>')

ejecutar_proceso()