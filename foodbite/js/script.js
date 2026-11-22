
"use strict";

const products = [
  {
    id: 1,
    name: "Chicken Katsu Rice",
    category: "Meals",
    price: 89,
    description: "Crispy chicken with rice and sauce",
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Campus Chicken Meal",
    category: "Meals",
    price: 99,
    description: "A filling student favorite",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    name: "Beef Burger",
    category: "Snacks",
    price: 75,
    description: "Juicy beef patty and fresh lettuce",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    name: "Club Sandwich",
    category: "Snacks",
    price: 65,
    description: "Toasted sandwich with tasty filling",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    name: "Iced Coffee",
    category: "Drinks",
    price: 55,
    description: "Cold and creamy coffee",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    name: "Fruit Soda",
    category: "Drinks",
    price: 45,
    description: "Refreshing fruit soda with ice",
    image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 7,
    name: "Chocolate Cake",
    category: "Desserts",
    price: 60,
    description: "Soft chocolate cake slice",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 8,
    name: "Strawberry Cheesecake",
    category: "Desserts",
    price: 75,
    description: "Creamy cheesecake with strawberries",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 9,
    name: "Chicken Rice Bowl",
    category: "Meals",
    price: 95,
    description: "Savory chicken rice bowl",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: 10,
    name: "French Fries",
    category: "Snacks",
    price: 50,
    description: "Golden crispy french fries",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80"
  }
];

const DELIVERY_FEE = 10;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

let cart = readStorage("fb_cart", []);
let orders = readStorage("fb_orders", []);
let users = readStorage("fb_users", []);
let session = readStorage("fb_session", null);

let profile = readStorage("fb_profile", {
  name: "FoodBite Customer",
  email: "customer@example.com",
  phone: "",
  address: "Campus Gate 2"
});

let activeCategory = "All";
let searchText = "";
let currentOrder = orders[0] || null;
let priceAscending = true;

const $ = selector => document.querySelector(selector);

function money(amount) {
  return "₱" + Number(amount).toFixed(2);
}

function saveData() {
  localStorage.setItem("fb_cart", JSON.stringify(cart));
  localStorage.setItem("fb_orders", JSON.stringify(orders));
  localStorage.setItem("fb_users", JSON.stringify(users));
  localStorage.setItem("fb_profile", JSON.stringify(profile));
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.textContent = "";
  }, 2200);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showLoading(message, callback) {
  const splash = $("#splashScreen");

  $("#splashMessage").textContent = message;

  splash.style.display = "flex";
  splash.classList.remove("hide");

  setTimeout(() => {
    splash.classList.add("hide");

    setTimeout(() => {
      splash.style.display = "none";

      if (callback) callback();
    }, 350);

  }, 1100);
}


function showLogin() {
  $("#appShell").classList.add("hidden");
  $("#registerScreen").classList.add("hidden");
  $("#loginScreen").classList.remove("hidden");
}

function showRegister() {
  $("#loginScreen").classList.add("hidden");
  $("#registerScreen").classList.remove("hidden");
}

function loginUser(email, password) {
  const user = users.find(item =>
    item.email.toLowerCase() === email.toLowerCase() &&
    item.password === password
  );

  if (!user) {
    showToast("Incorrect email or password.");
    return;
  }

  session = { email: user.email };

  profile = {
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    address: user.address || "Campus Gate 2"
  };

  localStorage.setItem("fb_session", JSON.stringify(session));
  saveData();

  $("#loginPassword").value = "";

  showLoading("WELCOME TO 3BITE", () => {
    $("#loginScreen").classList.add("hidden");
    $("#appShell").classList.remove("hidden");

    renderProfile();
    showScreen("dashboard");

    showToast("Welcome back!");
  });
}

function registerUser(name, email, password) {
  const exists = users.some(user =>
    user.email.toLowerCase() === email.toLowerCase()
  );

  if (exists) {
    showToast("Email already registered.");
    return;
  }

  const user = {
    name,
    email,
    password,
    phone: "",
    address: "Campus Gate 2"
  };

  users.push(user);

  profile = {
    name,
    email,
    phone: "",
    address: "Campus Gate 2"
  };

  session = { email };

  localStorage.setItem("fb_session", JSON.stringify(session));
  saveData();

  $("#registerForm").reset();

  showLoading("CREATING YOUR ACCOUNT", () => {
    $("#registerScreen").classList.add("hidden");
    $("#appShell").classList.remove("hidden");

    renderProfile();
    showScreen("dashboard");

    showToast("Account created successfully!");
  });
}


function logoutUser() {
  localStorage.removeItem("fb_session");
  session = null;

  $("#appShell").classList.add("hidden");
  $("#loginScreen").classList.add("hidden");
  $("#registerScreen").classList.add("hidden");

  showLoading("LOGGING OUT...", () => {
    $("#loginEmail").value = "";
    $("#loginPassword").value = "";

    showLogin();
  });
}


function showScreen(name) {
  const screens = {
    dashboard: "dashboardScreen",
    checkout: "checkoutScreen",
    tracking: "trackingScreen",
    profile: "profileScreen"
  };

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = $("#" + screens[name]);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.nav === name ||
      (name === "tracking" && button.dataset.nav === "orders")
    );
  });

  if (name === "checkout") renderCheckout();
  if (name === "tracking") renderTracking();
  if (name === "profile") renderProfile();

  window.scrollTo(0, 0);
}


function renderProducts() {
  const list = $("#productList");

  const filtered = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchText) ||
      product.description.toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  list.innerHTML = filtered.map(product => `
    <article class="product-card">

      <img
        src="${product.image}"
        alt="${escapeHTML(product.name)}"
        loading="lazy"
        onerror="this.onerror=null;this.src='https://placehold.co/400x400/e9f6f3/087b75?text=Food';"
      >

      <div class="product-info">
        <small>${product.category.toUpperCase()}</small>
        <h3>${escapeHTML(product.name)}</h3>
        <p>${escapeHTML(product.description)}</p>
      </div>

      <div class="product-side">
        <span class="price">${money(product.price)}</span>
        <button class="add-btn" data-add="${product.id}">+ Add</button>
      </div>

    </article>
  `).join("");

  $("#emptyProducts").classList.toggle(
    "hidden",
    filtered.length !== 0
  );
}

function renderCartBadge() {
  const quantity = cart.reduce(
    (total, item) => total + item.qty,
    0
  );

  $("#cartBadge").textContent = quantity;
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, qty: 1 });
  }

  saveData();
  renderCartBadge();

  showToast("Added to your cart!");
}

function getCartProducts() {
  return cart.map(item => {
    const product = products.find(p => p.id === item.id);

    return product
      ? { ...product, qty: item.qty }
      : null;
  }).filter(Boolean);
}

function getSubtotal() {
  return getCartProducts().reduce(
    (total, item) => total + item.price * item.qty,
    0
  );
}

function renderCheckout() {
  const items = getCartProducts();

  $("#checkoutItems").innerHTML = items.length
    ? items.map(item => `
      <div class="checkout-line">

        <img
          src="${item.image}"
          alt="${escapeHTML(item.name)}"
          onerror="this.onerror=null;this.src='https://placehold.co/100x100/e9f6f3/087b75?text=Food';"
        >

        <div>
          <b>${escapeHTML(item.name)}</b>
          <small>Qty: ${item.qty} × ${money(item.price)}</small>
        </div>

        <strong>${money(item.price * item.qty)}</strong>
      </div>
    `).join("")
    : `<div class="empty-state">Your cart is empty. Go to Home to add food.</div>`;

  const subtotal = getSubtotal();
  const delivery = items.length ? DELIVERY_FEE : 0;

  $("#checkoutSubtotal").textContent = money(subtotal);
  $("#checkoutDelivery").textContent = money(delivery);
  $("#checkoutTotal").textContent = money(subtotal + delivery);

  $("#checkoutAddressTitle").textContent =
    profile.address || "Add delivery address";

  $("#checkoutAddressText").textContent =
    profile.address || "Tap to enter your address";

  $("#placeOrder").disabled = !items.length;
  $("#placeOrder").style.opacity = items.length ? "1" : ".5";
}

function placeOrder() {
  const items = getCartProducts();

  if (!items.length) {
    showToast("Your cart is empty.");
    return;
  }

  if (!profile.address.trim()) {
    openAddressModal();
    return;
  }

  const payment = document.querySelector(
    'input[name="payment"]:checked'
  ).value;

  const order = {
    id: "FB-" + String(Date.now()).slice(-6),
    date: new Date().toLocaleString(),
    items: items.map(item => ({ ...item })),
    subtotal: getSubtotal(),
    delivery: DELIVERY_FEE,
    total: getSubtotal() + DELIVERY_FEE,
    address: profile.address,
    payment,
    status: "Preparing your order",
    step: 2
  };

  orders.unshift(order);
  currentOrder = order;
  cart = [];

  saveData();
  renderCartBadge();
  showScreen("tracking");

  showToast("Your order has been placed!");
}

function renderTracking() {
  if (!currentOrder) {
    $("#trackingOrderItems").innerHTML =
      `<div class="empty-state">No order available to track.</div>`;

    $("#trackingOrderId").textContent = "No active order";
    $("#trackingStatusTitle").textContent = "No active order";
    $("#timeline").innerHTML = "";

    return;
  }

  $("#trackingStatusTitle").textContent = currentOrder.status;
  $("#trackingStatusSubtitle").textContent =
    "Thanks! We're taking care of your order.";

  $("#trackingOrderId").textContent = currentOrder.id;

  $("#trackingOrderItems").innerHTML =
    currentOrder.items.map(item => `
      <div class="track-item">

        <img
          src="${item.image}"
          alt="${escapeHTML(item.name)}"
          onerror="this.onerror=null;this.src='https://placehold.co/100x100/e9f6f3/087b75?text=Food';"
        >

        <div>
          <b>${escapeHTML(item.name)}</b>
          <small>Qty: ${item.qty}</small>
        </div>

        <strong>${money(item.price * item.qty)}</strong>

      </div>
    `).join("");

  const steps = [
    "Order placed",
    "Preparing your order",
    "Ready for pickup",
    "Completed"
  ];

  const descriptions = [
    "We received your order",
    "The kitchen is preparing your food",
    "Your order is ready",
    "Enjoy your meal!"
  ];

  $("#timeline").innerHTML = steps.map((step, index) => `
    <div class="timeline-step ${index < currentOrder.step ? "done" : ""}">
      <span class="timeline-dot"></span>
      <div>
        <b>${step}</b>
        <small>${descriptions[index]}</small>
      </div>
    </div>
  `).join("");
}


function renderProfile() {
  $("#profileNameDisplay").textContent = profile.name;
  $("#profileEmailDisplay").textContent = profile.email;

  $("#avatarInitials").textContent = profile.name
    .split(" ")
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function openModal(title, content) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = content;
  $("#modalBackdrop").classList.remove("hidden");
}

function closeModal() {
  $("#modalBackdrop").classList.add("hidden");
}

function openAddressModal() {
  openModal("Delivery address", `
    <form class="modal-form" id="addressForm">

      <label>Delivery location</label>

      <input
        name="address"
        required
        value="${escapeHTML(profile.address)}"
        placeholder="House number, street, barangay"
      >

      <button class="primary-button">Save address</button>

    </form>
  `);
}

function openProfileModal() {
  openModal("Edit profile", `
    <form class="modal-form" id="profileForm">

      <label>Full name</label>
      <input name="name" required value="${escapeHTML(profile.name)}">

      <label>Email address</label>
      <input name="email" type="email" required value="${escapeHTML(profile.email)}">

      <label>Phone number</label>
      <input name="phone" value="${escapeHTML(profile.phone || "")}" placeholder="09XXXXXXXXX">

      <label>Delivery address</label>
      <textarea name="address" rows="2">${escapeHTML(profile.address || "")}</textarea>

      <button class="primary-button">Save changes</button>

    </form>
  `);
}

function showOrderHistory() {
  const content = orders.length
    ? orders.map(order => `
      <div class="checkout-line">

        <div>
          <b>${escapeHTML(order.id)}</b>
          <small>${escapeHTML(order.date)} · ${escapeHTML(order.status)}</small>
        </div>

        <strong>${money(order.total)}</strong>

        <button class="add-btn" data-view-order="${escapeHTML(order.id)}">
          Track
        </button>

      </div>
    `).join("")
    : `<p class="empty-state">No orders yet.</p>`;

  openModal("My Orders", `<div>${content}</div>`);
}

$("#loginForm").addEventListener("submit", event => {
  event.preventDefault();

  loginUser(
    $("#loginEmail").value.trim(),
    $("#loginPassword").value
  );
});

$("#registerForm").addEventListener("submit", event => {
  event.preventDefault();

  registerUser(
    $("#registerName").value.trim(),
    $("#registerEmail").value.trim(),
    $("#registerPassword").value
  );
});

$("#showRegister").addEventListener("click", showRegister);
$("#showLogin").addEventListener("click", showLogin);
$("#logoutButton").addEventListener("click", logoutUser);
4
$("#productList").addEventListener("click", event => {
  const button = event.target.closest("[data-add]");

  if (button) {
    addToCart(Number(button.dataset.add));
  }
});

$("#categories").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");

  if (!button) return;

  activeCategory = button.dataset.category;

  document.querySelectorAll(".category").forEach(category => {
    category.classList.toggle("active", category === button);
  });

  renderProducts();
});

$("#searchInput").addEventListener("input", event => {
  searchText = event.target.value.toLowerCase().trim();
  renderProducts();
});

$("#clearSearch").addEventListener("click", () => {
  $("#searchInput").value = "";
  searchText = "";
  renderProducts();
});

$("#seeAll").addEventListener("click", () => {
  activeCategory = "All";

  document.querySelectorAll(".category").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === "All"
    );
  });

  renderProducts();
});

$("#sortButton").addEventListener("click", () => {
  priceAscending = !priceAscending;

  products.sort((a, b) =>
    priceAscending ? a.price - b.price : b.price - a.price
  );

  $("#sortButton").textContent = priceAscending
    ? "Price: Low to High"
    : "Price: High to Low";

  renderProducts();
});

$("#promoExplore").addEventListener("click", () => {
  $("#categories").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll("[data-nav]").forEach(button => {
  button.addEventListener("click", () => {
    const page = button.dataset.nav;

    if (page === "orders") {
      showOrderHistory();
      return;
    }

    showScreen(page);
  });
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.go);
  });
});

$("#headerProfile").addEventListener("click", () => {
  showScreen("profile");
});

$("#placeOrder").addEventListener("click", placeOrder);
$("#editAddress").addEventListener("click", openAddressModal);
$("#editProfile").addEventListener("click", openProfileModal);
$("#closeModal").addEventListener("click", closeModal);

$("#modalBackdrop").addEventListener("click", event => {
  if (event.target === $("#modalBackdrop")) {
    closeModal();
  }
});

$("#modalBody").addEventListener("submit", event => {
  event.preventDefault();

  const data = new FormData(event.target);

  if (event.target.id === "addressForm") {
    profile.address = data.get("address").trim();

    const account = users.find(user =>
      user.email.toLowerCase() === profile.email.toLowerCase()
    );

    if (account) account.address = profile.address;

    saveData();
    renderCheckout();
    closeModal();

    showToast("Address saved!");
  }

  if (event.target.id === "profileForm") {
    const oldEmail = profile.email;

    profile = {
      name: data.get("name").trim(),
      email: data.get("email").trim(),
      phone: data.get("phone").trim(),
      address: data.get("address").trim()
    };

    const account = users.find(user =>
      user.email.toLowerCase() === oldEmail.toLowerCase()
    );

    if (account) {
      Object.assign(account, profile);
      session = { email: profile.email };
      localStorage.setItem("fb_session", JSON.stringify(session));
    }

    saveData();
    renderProfile();
    renderCheckout();
    closeModal();

    showToast("Profile updated!");
  }
});

$("#modalBody").addEventListener("click", event => {
  const button = event.target.closest("[data-view-order]");

  if (!button) return;

  currentOrder = orders.find(
    order => order.id === button.dataset.viewOrder
  );

  closeModal();
  showScreen("tracking");
});

$("#trackBack").addEventListener("click", () => {
  showScreen("dashboard");
});

$("#contactButton").addEventListener("click", () => {
  showToast("Please contact the campus food store.");
});

document.querySelectorAll("[data-profile-action]").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.profileAction;

    if (action === "orders") {
      showOrderHistory();
    } else if (action === "address") {
      openAddressModal();
    } else if (action === "payment") {
      showToast("Choose payment at checkout.");
    } else {
      showToast("Please contact 3Bite support.");
    }
  });
});

function initializeApp() {
  renderProducts();
  renderCartBadge();
  renderProfile();

  $("#clock").textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  if (session) {
    const user = users.find(item =>
      item.email.toLowerCase() === session.email.toLowerCase()
    );

    if (user) {
      profile = {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "Campus Gate 2"
      };

      saveData();
    } else {
      session = null;
      localStorage.removeItem("fb_session");
    }
  }

  showLoading("PREPARING YOUR EXPERIENCE", () => {
    if (session) {
      $("#appShell").classList.remove("hidden");
      showScreen("dashboard");
    } else {
      showLogin();
    }
  });
}

document.addEventListener("DOMContentLoaded", initializeApp);
