import pandas as pd
import numpy as np
from faker import Faker

# ----------------- CONFIGURACIÓN -----------------
N = 1000  # Cantidad de registros que deseas generar
ANIO_INICIO = 2023
ANIO_FIN = 2025  # Inclusive

# ------------------------------------------------
fake = Faker()

# Generar fechas aleatorias entre dos años con hora incluida
def generar_fechas_aleatorias(n, anio_inicio, anio_fin):
    start_ts = pd.Timestamp(f'{anio_inicio}-01-01 00:00:00').value // 10**9
    end_ts = pd.Timestamp(f'{anio_fin + 1}-01-01 00:00:00').value // 10**9
    fechas_aleatorias = pd.to_datetime(np.random.randint(start_ts, end_ts, size=n), unit='s')
    return fechas_aleatorias

# Tabla DIM_Tiempo desnormalizada
fechas = generar_fechas_aleatorias(N, ANIO_INICIO, ANIO_FIN)
fechas_series = pd.Series(fechas)

dim_tiempo = pd.DataFrame({
    "id_fecha": range(1, N + 1),
    "dia": fechas_series.dt.day,
    "mes": fechas_series.dt.month,
    "anio": fechas_series.dt.year,
    "fecha_creacion": fechas_series
})

# Otras dimensiones simuladas
dim_sensor = pd.DataFrame({
    "sensor_id": range(1, 11),
    "sensor_modelo": [fake.word() for _ in range(10)],
    "sensor_tipo_medicion": np.random.choice(["corriente", "voltaje", "potencia", "frecuencia"], 10),
    "sensor_estado": np.random.choice([True, False], 10)
})

dim_circuito = pd.DataFrame({
    "id_circuito": range(1, 11),
    "circuito_capacidad_nominal": np.random.choice(["50A", "75A", "100A", "150A"], 10),
    "circuito_descripcion": [fake.sentence() for _ in range(10)],
    "circuito_tipo": np.random.choice(["principal", "secundario", "emergencia"], 10)
})

dim_zona = pd.DataFrame({
    "id_zona": range(1, 6),
    "zona_nombre": [f"Zona {chr(65+i)}" for i in range(5)],
    "zona_descripcion": [fake.word() for _ in range(5)]
})

dim_nivel = pd.DataFrame({
    "id_nivel": range(1, 4),
    "nivel_nombre": [f"Nivel {i}" for i in range(1, 4)],
    "nivel_descripcion": [fake.word() for _ in range(3)]
})

dim_edificio = pd.DataFrame({
    "id_edificio": range(1, 4),
    "edificio_nombre": ["Edificio Central", "Edificio Anexo", "Torre Norte"],
    "edificio_descripcion": ["Principal", "Secundario", "Oficinas"]
})

# Tabla de hechos
fact_medicion = pd.DataFrame({
    "id_medicion": range(1, N + 1),
    "voltaje": np.random.uniform(110, 240, N),
    "corriente": np.random.uniform(0, 100, N),
})
fact_medicion["potencia_calc"] = fact_medicion["voltaje"] * fact_medicion["corriente"]
fact_medicion["energia_acumulada_calc"] = fact_medicion["potencia_calc"].cumsum() / 1000
fact_medicion["factor_potencia"] = np.round(np.random.uniform(0.7, 1.0, N), 2)
fact_medicion["frecuencia"] = np.random.choice([49.9, 50.0, 50.1, 60.0], N)

# Claves foráneas aleatorias
fact_medicion["id_sensor"] = np.random.choice(dim_sensor["sensor_id"], N)
fact_medicion["id_circuito"] = np.random.choice(dim_circuito["id_circuito"], N)
fact_medicion["id_zona"] = np.random.choice(dim_zona["id_zona"], N)
fact_medicion["id_nivel"] = np.random.choice(dim_nivel["id_nivel"], N)
fact_medicion["id_edificio"] = np.random.choice(dim_edificio["id_edificio"], N)
fact_medicion["id_fecha"] = dim_tiempo["id_fecha"]

# Joins
df = fact_medicion \
    .merge(dim_sensor, left_on="id_sensor", right_on="sensor_id", how="left") \
    .merge(dim_circuito, on="id_circuito", how="left") \
    .merge(dim_zona, on="id_zona", how="left") \
    .merge(dim_nivel, on="id_nivel", how="left") \
    .merge(dim_edificio, on="id_edificio", how="left") \
    .merge(dim_tiempo, on="id_fecha", how="left")

# Selección final
df_final = df[[
    "id_medicion", "voltaje", "corriente", "potencia_calc", "energia_acumulada_calc",
    "factor_potencia", "frecuencia",
    "sensor_modelo", "sensor_tipo_medicion", "sensor_estado",
    "circuito_capacidad_nominal", "circuito_descripcion", "circuito_tipo",
    "zona_nombre", "zona_descripcion",
    "nivel_nombre", "nivel_descripcion",
    "edificio_nombre", "edificio_descripcion",
    "dia", "mes", "anio", "fecha_creacion"
]]

# ✅ Exportar con formato Parquet versión 1.0 (compatible con parquetjs)
df_final.to_parquet(
    "mediciones_desnormalizadas.parquet",
    index=False,
    engine="pyarrow",
    version="1.0",           # 👈 fuerza formato Parquet v1
    compression="snappy"      # opcional: compresión ligera y rápida
)

print(f"✅ Archivo generado en formato Parquet v1.0 con {N} registros ({ANIO_INICIO}-{ANIO_FIN}).")
