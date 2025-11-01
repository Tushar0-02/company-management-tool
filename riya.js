const team = [
  {
    name: "Tushar Jadhav",
    role: "Founder",
    image: "WhatsApp Image 2025-10-07 at 2.14.41 PM.jpeg",
    link: "login.html"
  },
  {
    name: "Riya Kavathe",
    role: "CEO",
    image: "riyain.jpg",
    link: "login.html"
  },
  {
    name: "Siddhesh Sulekar",
    role: "COO",
    image: "sidhesh.jpg",
    link: "login.html"
  },
  {
    name: "Aditya Patil",
    role: "Fronted Developer",
    image: "aditya.jpg",
    link: "login.html"
  },
  {
    name: "Tanvi Bane",
    role: "Backend Engineer",
    image: "tanvifinal.jpeg",
    link: "login.html"
  },
  {
    name: "Siddhi Potdar",
    role: "UI/UX Designer",
    image: "siddhi.jpg",
    link: "login.html"
  },
  {
    name: "Swaroop Patil",
    role: "Marketing Head",
    image: "swaroop.jpeg",
    link: "login.html"
  }
];

const container = document.getElementById("team");

team.forEach(member => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <a href="${member.link}">
      <img src="${member.image}" alt="${member.name}" />
    </a>
    <h3>${member.name}</h3>
    <h4>${member.role}</h4>
  `;
  container.appendChild(card);
});
