import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/', async (req, res) => {

  try {
    const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
      headers: {
        'X-Api-Key': process.env.POKEMON_API_KEY || '',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener las cartas', error);
    res.status(500).json({ message: 'No se pudo obtener la carta' });
  }
});

// GET /api/cards/:id → Obtener una carta por ID
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const response = await axios.get(`https://api.pokemontcg.io/v2/cards/${id}`, {
      headers: {
        'X-Api-Key': process.env.POKEMON_API_KEY || '',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(`Error al obtener la carta con ID ${id}:`, error);
    res.status(500).json({ message: 'No se pudo obtener la carta' });
  }
});

export default router;
