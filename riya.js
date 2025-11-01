const team = [
  {
    name: "Tushar Jadhav",
    role: "Founder",
    image: "tushar.jpg",

  },
  {
    name: "Riya Kavathe",
    role: "CEO",
    image: "riya.jpg",

  },
  {
    name: "Siddhesh Sulekar",
    role: "COO",
    image: "sidhesh.jpg",

  },
  {
    name: "Aditya Patil",
    role: "Fronted Devolper",
    image: "aditya.jpg",

  },
  {
    name: "Tanvi Bane",
    role: "Backend Engineer",
    image: "tanvi.jpeg",


  },
  {
    name: "Siddhi Potdar",
    role: "UI/UX Designer",
    image: "siddhi.jpg",

  },
  {
    name: "Swaroop Patil",
    role: "Marketing Head",
    image: "swaroop.jpeg",

  }
];

const container = document.getElementById("team");

team.forEach(member => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img src="${member.image}" alt="${member.name}" />
    <h3>${member.name}</h3>
    <h4>${member.role}</h4>
    
  `;
  container.appendChild(card);
});
