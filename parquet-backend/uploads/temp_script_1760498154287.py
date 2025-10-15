
import pandas as pd
import json
try:
    df = pd.read_parquet("C:\\Users\\luism\\Desktop\\ProyectosPersonales\\AnalisisII\\monitoreo-edificio\\complement\\mediciones_desnormalizadas.parquet")
    # Convertir todos los tipos numéricos
    for col in df.select_dtypes(include=['int64', 'float64']).columns:
        df[col] = df[col].astype('float64')
    print(df.to_json(orient='records', date_format='iso'))
except Exception as e:
    print("ERROR:" + str(e))
    exit(1)
      