# Carbon Tracker Service — EcoLogistics

Microservicio de cálculo de huella de carbono (CO₂) para trayectos de carga, desarrollado como ejercicio de **programación asistida por IA generativa** aplicando técnicas de ingeniería de prompts (Persona, Chain-of-Thought, Refinamiento Iterativo, Few-shot y Self-Critique).

## Contenido de esta carpeta

```
parteA/
├── docs/
│   ├── bitacora-prompts.md      → Registro de prompts usados y evolución del código
│   └── reflexion-critica.md     → Ventajas/riesgos de usar LLMs en este proceso
├── src/
│   ├── domain/                  → Lógica de negocio pura (sin dependencias de Express)
│   │   ├── types.ts             → Tipos de dominio (VehicleType, EmissionInput/Result)
│   │   ├── errors.ts            → Errores de dominio (ValidationError, UnsupportedVehicleTypeError)
│   │   ├── emissionFactors.ts   → Factores de emisión por tipo de vehículo
│   │   ├── validators.ts        → Validación y normalización de la entrada
│   │   └── carbonCalculator.ts  → Función principal de cálculo
│   ├── controllers/
│   │   └── carbonController.ts  → Adapta HTTP ↔ dominio
│   ├── routes/
│   │   └── carbonRoutes.ts      → Definición de rutas de la API
│   ├── middleware/
│   │   └── errorHandler.ts      → Manejo centralizado de errores
│   ├── app.ts                   → Construcción de la app Express (testeable sin levantar puerto)
│   └── server.ts                → Punto de entrada (levanta el servidor HTTP)
└── tests/
    ├── domain/carbonCalculator.test.ts
    ├── middleware/errorHandler.test.ts
    └── routes/carbonRoutes.test.ts
```

## Cómo correrlo

```bash
cd parteA
npm install
npm run dev        # servidor en http://localhost:3000
npm test           # suite de tests con reporte de cobertura (umbral: 90%)
npm run build      # compila a dist/
```

## API

`POST /api/carbon-footprint`

```json
{
  "vehicleType": "DIESEL",
  "cargoWeightTons": 10,
  "distanceKm": 100,
  "efficiencyFactor": 1
}
```

Respuesta `200`:

```json
{
  "vehicleType": "DIESEL",
  "cargoWeightTons": 10,
  "distanceKm": 100,
  "efficiencyFactor": 1,
  "emissionFactorKgPerTonKm": 0.062,
  "co2EmissionsKg": 62
}
```

Ante datos inválidos (peso ≤ 0, distancia negativa, tipo de vehículo no soportado, campos faltantes o no numéricos) responde `400` con `{ "error": "...", "message": "..." }`.

## Fórmula de cálculo

```
CO2 (kg) = distancia_km × peso_toneladas × factor_emisión(tipo_vehículo) × factor_eficiencia
```

| Tipo de vehículo | Factor (kg CO2 / ton·km) |
|---|---|
| ELECTRIC | 0.02 |
| HYBRID | 0.045 |
| DIESEL | 0.062 |

Ver `docs/bitacora-prompts.md` para el razonamiento (Chain-of-Thought) detrás de esta fórmula.
