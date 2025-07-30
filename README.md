# 🔥 Pokémon TCG Backend

Este backend proporciona una API intermedia entre tu frontend y la API oficial de [Pokémon TCG](https://pokemontcg.io/). Se encarga de recuperar cartas, listarlas o consultar detalles individuales, utilizando Express y Axios.

---

## 🚀 Endpoints disponibles

- `GET /api/cards` → Devuelve una lista de cartas Pokémon.
- `GET /api/cards/:id` → Devuelve los detalles de una carta específica.

---

## 🔧 Instalación y uso local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/pokemon-app.git
   cd pokemon-app/backend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env` en la raíz del backend usando la plantilla:
   ```bash
   cp .env.example .env
   ```

4. Añade tu clave API de PokéTCG en el archivo `.env`:
   ```
   POKEMON_API_KEY=tu_clave_api_aquí
   ```

   👉 Puedes conseguir una clave gratuita aquí: [https://pokemontcg.io](https://pokemontcg.io)

5. Ejecuta el servidor en desarrollo:
   ```bash
   npm run dev
   ```

   El backend estará disponible en `http://localhost:3000`.

---

## 📁 Estructura

```
backend/
├── routes/
│   └── card.ts         # Rutas para obtener cartas
├── .env                # Variables privadas (NO subir)
├── .env.example        # Plantilla para desarrollo
├── index.ts            # Configuración principal de Express
├── package.json
```

---

## ✅ Buenas prácticas

- Nunca subas `.env` al repositorio (ya está incluido en `.gitignore`).
- Usa `.env.example` para que otros sepan qué variables necesitan.
- Si haces deploy (por ejemplo en Render), configura la variable de entorno desde su panel.

---

## 🧑‍💻 Autor

Sergio García Yugueros  
📧 Contacto: [sgarciayugueros@gmail.com]  
🚀 Proyecto personal desarrollado con React, Node.js, TypeScript y la API de PokéTCG
