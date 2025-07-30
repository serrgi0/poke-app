import { useEffect, useState } from 'react'
import axios from 'axios';


interface Card{
  id: string;
  name: string;
  images: {
    small: string;
  };
}

function App() {
  
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(()=>{
    axios.get('http://localhost:3000/api/cards')
    .then(response => {
      setCards(response.data.data);
    })
    .catch(error => {
      console.error('Error al obtener las cartas', error);
    });
  }, []);

  return (
    <div className="p-4 bg-neutral-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Cartas Pokémon</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.id} className="bg-neutral-800 rounded p-2 shadow">
            <img src={card.images.small} alt={card.name} />
            <p className="mt-2 text-center">{card.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

