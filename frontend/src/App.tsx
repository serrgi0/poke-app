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
  });

  return (
    
  );
}

export default App;

