import { createContext, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const blogs = [
    {
      id: 1,
      title: "Dhanolti – A Hidden Gem for Nature Lovers",
      category: "By Vandana",
      date: "22 Nov",
      image:
        "https://res.cloudinary.com/dwbbpznwe/image/upload/v1737723767/_MG_8474_a18qzk.jpg",
      content: [
        "It was our first visit to Dhanolti, and I must say, it was everything we hoped for and more. We stayed at the beautiful Into the Wild Stays, a place that felt like a home away from home. The property is an artistic masterpiece surrounded by the majestic Garhwal mountain peaks, making every moment there feel magical. The most delightful part of our stay was meeting the two adorable mountain dogs, Mowgli and Bagheera. These gentle giants followed us on every jungle hike and nature trail we explored, adding a sense of adventure and companionship to our trip.",
        "One of the most memorable experiences was our outdoor picnic amidst the serene woods. The crisp mountain air, the soothing sound of birds, and the breathtaking views made it an experience to cherish. Dhanolti is perfect for anyone looking to escape the chaos of city life, with its quiet trails, hidden waterfalls, and panoramic views of the snow-capped Himalayas.",
        "If you're visiting nearby destinations like Mussoorie, Dehradun, or Tehri, make sure to stay in Dhanolti. It's the ideal base to explore these places while enjoying the peace and tranquility that only Dhanolti can offer.",
      ],
    },
    {
      id: 2,
      title: "Tehri – Adventure Meets Comfort",
      category: "By Prashant",
      date: "21 Nov",
      image:
        "https://res.cloudinary.com/dwbbpznwe/image/upload/v1737723933/Tehri-Lake-Festival-Feature_1_goddwc.jpg",
      content: [
        "Tehri was an incredible mix of adventure and relaxation. The highlight of our trip was staying at Pine and Tails Villa, a stunning property located in Tehri, surrounded by lush pine forests and offering mesmerizing views of the mountains. We booked the entire villa for our family getaway, and it was the perfect space for bonding. The villa's cozy interiors, spacious balconies, and serene surroundings made our stay truly unforgettable.",
        "Tehri Dam was just a short drive away and offered a thrilling day of water sports. We enjoyed jet skiing, banana boat rides, and kayaking, which were all well-organized and safe. The views of the shimmering blue water against the backdrop of the towering mountains were breathtaking. After a day full of adrenaline, returning to the warmth of Pine and Tails Villa felt like pure bliss.",
        "Tehri has a lot to offer, but staying in Dhanolti is the perfect way to experience the best of both worlds. You get the adventure of Tehri and the serene beauty of Dhanolti, making your trip wholesome and rejuvenating.",
      ],
    },
    {
      id: 3,
      title: "Surkanda Devi – A Snowy Day Hike",
      category: "Chitra",
      date: "20 Nov",
      image:
        "https://res.cloudinary.com/dwbbpznwe/image/upload/v1737724256/Surkanda_Mata_Temple_ipfzzu.webp",
      content: [
        "Visiting the Surkanda Devi Temple during snowfall was like stepping into a winter wonderland. The temple, located at an altitude of about 10,000 feet, is a perfect day hike for those seeking a mix of spirituality and adventure. The trail to the temple was lined with snow-covered trees, and every step felt like walking through a postcard.",
        "Reaching the temple, we were greeted with breathtaking views of the snow-capped Himalayan peaks. The sense of peace and serenity at the temple was unmatched. Whether you're an avid trekker or someone just looking for a soulful escape, this hike is worth every effort.",
        "After the hike, we retreated to Dhanolti, where the warmth and comfort of Into the Wild Stays awaited us. Dhanolti's proximity to Surkanda Devi and its calm ambiance make it an ideal place to stay. For those exploring the Garhwal region, Dhanolti offers the perfect mix of adventure and relaxation.",
      ],
    },
    {
      id: 4,
      title: "Mussoorie – Old-World Charm with a Twist",
      category: "Hrishabh",
      date: "20 Nov",
      image:
        "https://images.pexels.com/photos/1441207/pexels-photo-1441207.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      content: [
        'Mussoorie, often called the "Queen of the Hills," has a charm that transports you back in time. During our visit, we explored Landour, a quiet and scenic area that feels untouched by time. We stopped by the famous Landour Bakery, known for its delicious bakes, and Char Dukan, a row of small eateries with historical significance. While the food at Char Dukan was slightly overhyped, the ambiance of the place was worth it. It gave us a glimpse into the old-world charm of the British colonial era.',
        "One fascinating fact we learned was that the first potato in India was grown in Mussoorie! It's little pieces of history like this that make the town so intriguing. However, Mussoorie can get quite crowded, especially during peak tourist seasons.",
        "That's why we decided to stay in Dhanolti at Into the Wild Stays. It gave us the best of both worlds – proximity to Mussoorie for sightseeing and a peaceful retreat to return to at the end of the day. Dhanolti is undoubtedly the better choice for those who want to enjoy the beauty of the hills without the hustle and bustle.",
      ],
    },
  ];

  return (
    <AppContext.Provider value={{ blogs }}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
