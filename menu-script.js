// API URL (Replace with actual API endpoint)
const API_URL = "https://qrmenu-api-tzzlx.ondigitalocean.app/api";

// Get modal elements
const modal = document.getElementById("dish-modal");
const modalImage = document.querySelector(".modal-image");
const modalTitle = document.querySelector(".modal-title");
const modalPrice = document.querySelector(".modal-price");
const modalDescription = document.querySelector(".modal-description");
const modalTags = document.querySelector(".modal-tags");
const closeModal = document.querySelector(".close-modal");

// Select search input
const searchInput = document.getElementById("search-input");

// Get elements
const menuList = document.getElementById("menu-sections");
const dishesContainer = document.getElementById("dishes-container");


// Function to filter dishes dynamically
function filterDishes() {
    const searchText = searchInput.value.trim().toLowerCase(); // Get input text (trim spaces)
    const allDishes = document.querySelectorAll(".dish-item"); // Select all dish elements

    console.log("Searching for:", searchText); // Debugging

    if (allDishes.length === 0) {
        console.warn("No dishes found! Make sure they are loaded.");
        return;
    }

    let hasResults = false; // Track if any dish is visible

    allDishes.forEach(dish => {
        const dishNameElement = dish.querySelector("h3"); // Get dish name
        if (!dishNameElement) return; // Skip if no name found

        const dishName = dishNameElement.textContent.toLowerCase(); // Convert dish name to lowercase

        // ✅ Partial match: If dish name contains the search text, show it
        if (dishName.includes(searchText)) {
            dish.style.display = "flex"; // Show dish if there's a match
            hasResults = true;
        } else {
            dish.style.display = "none"; // Hide if no match
        }
    });

    // ✅ Show "No results found" message if nothing matches
    const noResultsMessage = document.getElementById("no-results");
    if (!hasResults) {
        if (!noResultsMessage) {
            const message = document.createElement("p");
            message.id = "no-results";
            message.textContent = "Нічого не знайдено.";
            message.style.textAlign = "center";
            message.style.color = "#888";
            document.getElementById("dishes-container").appendChild(message);
        }
    } else {
        if (noResultsMessage) noResultsMessage.remove(); // Remove message when results are found
    }
}

// Function to open modal
function openModal(dish) {
    modalImage.src = dish.image;
    modalTitle.textContent = dish.name;
    modalPrice.textContent = `${dish.price} ₴`;
    modalDescription.textContent = dish.description;

    // Add tags dynamically
    modalTags.innerHTML = "";
    dish.tags.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.classList.add("modal-tag");
        tagElement.textContent = tag;
        modalTags.appendChild(tagElement);
    });

    modal.style.display = "flex"; // Show modal
}

// Function to close modal
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});


// Function to fetch and update menu header
async function loadMenuHeader() {
    try {
        const response = await fetch(`${API_URL}/restaurant`);
        const data = await response.json();

        // Update Logo, Name, and Address
        document.querySelector(".menu-logo").src = data.logo;
        document.querySelector(".restaurant-name").textContent = data.name;
        document.querySelector(".restaurant-address").textContent = data.address;

    } catch (error) {
        console.error("Error loading menu header:", error);
    }
}

// Fetch and load all categories and their dishes
async function loadMenu() {
    try {
        const response = await fetch(`${API_URL}/menu`);
        const data = await response.json();

        menuList.innerHTML = ""; // Clear existing items
        dishesContainer.innerHTML = ""; // Clear dishes

        data.sections.forEach(section => {
            // Create menu section item
            const sectionItem = document.createElement("li");
            sectionItem.classList.add("menu-section");
            sectionItem.textContent = section.name;

            // Create a category list (initially hidden)
            const categoryList = document.createElement("ul");
            categoryList.classList.add("menu-categories");
            categoryList.style.display = "none"; // Hide categories initially

            // Create a section container for dishes
            const sectionDiv = document.createElement("div");
            sectionDiv.classList.add("dish-category");
            sectionDiv.id = `section-${section.id}`; // Unique ID for scrolling
            dishesContainer.appendChild(sectionDiv);

            // Add section title
            const sectionTitle = document.createElement("h2");
            sectionTitle.textContent = section.name;
            sectionDiv.appendChild(sectionTitle);

            // Handle section click: Show categories and jump to the first category
            sectionItem.addEventListener("click", () => {
                // Toggle category visibility
                if (categoryList.style.display === "none") {
                    categoryList.style.display = "block"; // Show categories
                } else {
                    categoryList.style.display = "none"; // Hide categories
                    return;
                }

                // Scroll to the first category if it exists
                if (section.categories.length > 0) {
                    const firstCategoryId = section.categories[0].id;
                    document.getElementById(`category-${firstCategoryId}`).scrollIntoView({
                        behavior: "smooth"
                    });
                }
            });

            // Loop through categories
            if (section.categories) {
                section.categories.forEach(category => {
                    const categoryItem = document.createElement("li");
                    categoryItem.classList.add("menu-category");
                    categoryItem.textContent = category.name;
                    categoryItem.setAttribute("data-category-id", category.name); // ✅ Add category name as attribute

                    // Create a category container in dishes
                    const categoryDiv = document.createElement("div");
                    categoryDiv.classList.add("dish-category");
                    categoryDiv.id = `category-${category.id}`; // Unique ID for scrolling
                    categoryDiv.setAttribute("data-category-id", category.name); // ✅ Add attribute to the category div

                    sectionDiv.appendChild(categoryDiv);

                    // Add category title
                    const categoryTitle = document.createElement("h3");
                    categoryTitle.textContent = category.name;
                    categoryDiv.appendChild(categoryTitle);

                    // Load dishes inside this category
                    loadDishes(category.id, categoryDiv);

                    // Attach click event for category scrolling
                    categoryItem.addEventListener("click", (event) => {
                        event.stopPropagation(); // Prevent section click from toggling categories
                        document.getElementById(`category-${category.id}`).scrollIntoView({
                            behavior: "smooth"
                        });
                    });

                    categoryList.appendChild(categoryItem);
                });

                menuList.appendChild(sectionItem);
                menuList.appendChild(categoryList);
            }
        });

    } catch (error) {
        console.error("Error loading menu:", error);
    }
}

// Fetch and load dishes inside a category
async function loadDishes(categoryId, container) {
    try {
        const response = await fetch(`${API_URL}/menu/${categoryId}`);
        const data = await response.json();

        data.dishes.forEach(dish => {
            const dishDiv = document.createElement("div");
            dishDiv.classList.add("dish-item");

            // Set Default Image (Restaurant Logo)
            const restaurantLogo = document.querySelector(".menu-logo").src;

            // Dish Image
            const img = document.createElement("img");
            img.src = dish.image ? dish.image : restaurantLogo; // Use dish image if available, else use logo
            img.alt = dish.name;

            // Dish Info
            const infoDiv = document.createElement("div");
            infoDiv.classList.add("dish-info");

            const name = document.createElement("h3");
            name.textContent = dish.name;

            const desc = document.createElement("p");
            desc.textContent = dish.description;

            // Dish Price
            const price = document.createElement("div");
            price.classList.add("price");
            price.textContent = `${dish.price} ₴`;

            // Click event to open modal
            dishDiv.onclick = () => openModal(dish);

            // Assemble
            infoDiv.appendChild(name);
            infoDiv.appendChild(desc);
            dishDiv.appendChild(img);
            dishDiv.appendChild(infoDiv);
            dishDiv.appendChild(price);
            container.appendChild(dishDiv);
        });

    } catch (error) {
        console.error("Error loading dishes:", error);
    }
}

// Load restaurant data when the page is ready
document.addEventListener("DOMContentLoaded", loadMenuHeader);

document.addEventListener("DOMContentLoaded", async () => {
    await loadMenu(); // ✅ Ensure sections and dishes are loaded first

    // Check if a section was selected from index.html
    const selectedSection = localStorage.getItem("selectedSection");
    if (selectedSection) {
        localStorage.removeItem("selectedSection"); // Clear it after use

        // Wait to ensure elements are loaded
        setTimeout(() => {
            // ✅ Find the corresponding section title inside `#dishes-container`
            const allSections = document.querySelectorAll("#dishes-container h2");
            for (const section of allSections) {
                const sectionText = section.textContent.trim(); // Remove extra spaces

                // ✅ Match the selected section
                if (sectionText === selectedSection) {
                    console.log("Scrolling to section:", sectionText);

                    // ✅ Scroll to the section title inside menu-content
                    section.scrollIntoView({ behavior: "smooth", block: "start" });

                    break; // Stop loop once found
                }
            }
        }, 300); // Small delay to ensure elements are ready
    }
});

// Attach event listener to search input
searchInput.addEventListener("input", filterDishes);

// Get Sidebar, Buttons, and Overlay
const sidebar = document.querySelector(".menu-sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");
const closeSidebar = document.getElementById("close-sidebar");
const sidebarOverlay = document.querySelector(".sidebar-overlay");
const menuSections = document.getElementById("menu-sections"); // Parent element of categories

// Detect if it's a mobile device
function isMobile() {
    return window.innerWidth <= 768;
}

// Show Sidebar on Toggle Button Click
sidebarToggle.addEventListener("click", () => {
    sidebar.classList.add("open");
    sidebarOverlay.style.display = "block"; // Show overlay
});

// Hide Sidebar on Close Button Click
closeSidebar.addEventListener("click", () => {
    sidebar.classList.remove("open");
    sidebarOverlay.style.display = "none"; // Hide overlay
});

// Hide Sidebar When Clicking on Overlay (Empty Space)
sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    sidebarOverlay.style.display = "none"; // Hide overlay
});

// ✅ FIX: Close Sidebar When Clicking on Any Category (Mobile Only)
document.addEventListener("click", (event) => {
    const clickedElement = event.target.closest(".menu-category"); // Ensure click is inside a category
    if (clickedElement && isMobile()) {
        console.log("Category clicked:", clickedElement.textContent);

        // Close Sidebar
        sidebar.classList.remove("open");
        sidebarOverlay.style.display = "none"; // Hide overlay
    }
});

// Redirect to main page when clicking on logo, name, or address
document.addEventListener("DOMContentLoaded", () => {
    const elementsToRedirect = document.querySelectorAll(".menu-logo, .restaurant-name, .restaurant-address");

    elementsToRedirect.forEach(element => {
        element.addEventListener("click", () => {
            window.location.href = "/"; // Change to actual main page if needed
        });
    });
});