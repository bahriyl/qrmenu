// API URL (Replace with your actual API endpoint)
const API_URL = "https://qrmenu-api-tzzlx.ondigitalocean.app/api/restaurant";

// Function to fetch and update restaurant data dynamically
async function fetchRestaurantData() {
    try {
        const response = await fetch(API_URL); // Fetch API data
        const data = await response.json(); // Convert response to JSON

        // Update Banner Image
        document.querySelector(".banner").style.backgroundImage = `url('${data.bannerImage}')`;

        // Update Logo, Name, and Address
        document.querySelector(".logo").src = data.logo;
        document.querySelector(".restaurant-name").textContent = data.name;
        document.querySelector(".title").textContent = data.name;
        document.querySelectorAll(".restaurant-address").forEach(el => el.textContent = data.address);

        // Update About Text
        document.querySelector(".about-text").textContent = data.about;

        // Update Menu Sections Dynamically
        const menuList = document.querySelector(".menu-list");
        menuList.innerHTML = ""; // Clear existing items
        data.menuSections.forEach(section => {
            const li = document.createElement("li");
            li.textContent = section;
            menuList.appendChild(li);
        });

        // Update Working Hours
        document.querySelector(".working-hours").innerHTML = `<strong> ${data.workingHours} </strong>`;

        // Update Phone
        document.querySelector(".phone-number").textContent = data.phone;

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const menuList = document.querySelector(".menu-list");

    menuList.addEventListener("click", (event) => {
        if (event.target.tagName === "LI") {
            const sectionName = event.target.textContent.trim();
            localStorage.setItem("selectedSection", sectionName); // Store section name
            window.location.href = "menu.html"; // Redirect to menu page
        }
    });
});

// Load data when the page is ready
document.addEventListener("DOMContentLoaded", fetchRestaurantData);