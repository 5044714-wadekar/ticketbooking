const API = '/api';

// ==================== HELPER ====================
function showMsg(text, type) {
    const el = document.getElementById('msg');
    if (el) {
        el.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
    }
}

// ==================== NAVBAR ====================
async function loadNav() {
    const nav = document.getElementById('navRight');
    if (!nav) return;
    try {
        const res = await fetch(API + '/me').then(r => r.json());
        if (res.loggedIn) {
            let html = `<span class="text-white me-3">Hi, ${res.name}</span>`;
            html += `<a href="theaters.html" class="btn btn-sm btn-success me-2">Theaters</a>`;
            html += `<a href="mybookings.html" class="btn btn-sm btn-info me-2">My Bookings</a>`;
            if (res.role === 'admin')
                html += `<a href="admin.html" class="btn btn-sm btn-warning me-2">Admin</a>`;
            html += `<button class="btn btn-sm btn-danger" onclick="logout()">Logout</button>`;
            nav.innerHTML = html;
        } else {
            nav.innerHTML = `
                <a href="login.html" class="btn btn-sm btn-success me-2">Login</a>
                <a href="register.html" class="btn btn-sm btn-outline-light">Register</a>
            `;
        }
    } catch (e) {
        console.error('loadNav error:', e);
    }
}

async function logout() {
    try {
        await fetch(API + '/logout');
    } catch (e) {}
    window.location.href = 'login.html';
}

// ==================== THEATERS ====================
async function loadTheaters() {
    console.log('✅ loadTheaters called');
    try { loadNav(); } catch(e) {}
    
    try {
        const res = await fetch(API + '/theaters/city/Pune');
        const data = await res.json();
        const list = document.getElementById('theaterList');
        if (!list) return;
        
        if (!data || data.length === 0) {
            list.innerHTML = `<div class="col-12 text-center"><h4>No theaters available</h4></div>`;
            return;
        }
        
        list.innerHTML = data.map(t => `
            <div class="col-md-4 mb-4">
                <div class="card movie-card" style="cursor:pointer" onclick="selectTheater(${t.id})">
                    <div class="card-body text-center">
                        <h4>🎭 ${t.name}</h4>
                        <p class="text-muted">${t.location}, ${t.city}</p>
                        <button class="btn btn-primary w-100">Select</button>
                    </div>
                </div>
            </div>
        `).join('');
        console.log('🎉 Theaters rendered:', data.length);
    } catch (e) {
        console.error('❌ loadTheaters error:', e);
    }
}

function selectTheater(id) {
    window.location.href = 'index.html?theaterId=' + id;
}

// ==================== MOVIES ====================
async function loadMovies() {
    loadNav();
    const theaterId = new URLSearchParams(window.location.search).get('theaterId');
    
    let url = API + '/movies';
    if (theaterId) url = API + '/movies/theater/' + theaterId;
    
    try {
        const movies = await fetch(url).then(r => r.json());
        const list = document.getElementById('movieList');
        if (!list) return;
        
        if (!movies || movies.length === 0) {
            list.innerHTML = `<div class="col-12 text-center"><h4>No movies available.</h4></div>`;
            return;
        }
        
        list.innerHTML = movies.map(m => `
            <div class="col-md-4 mb-4">
                <div class="card movie-card">
                    <img src="${m.poster_url}" class="card-img-top"
                         onerror="this.src='https://via.placeholder.com/300x400/333/fff?text=${encodeURIComponent(m.title)}'">
                    <div class="card-body">
                        <h5>${m.title}</h5>
                        <p>⏰ ${m.show_time} | 💰 ₹${m.price}</p>
                        <a href="seats.html?id=${m.id}" class="btn btn-primary w-100">Book Now</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('loadMovies error:', e);
    }
}

// ==================== LOGIN ====================
async function doLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showMsg('Please enter email and password', 'warning');
        return;
    }
    
    try {
        const res = await fetch(API + '/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        
        if (data.success) {
            showMsg('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = data.role === 'admin' ? 'admin.html' : 'theaters.html';
            }, 800);
        } else {
            showMsg(data.message || 'Invalid credentials', 'danger');
        }
    } catch (e) {
        showMsg('Error: ' + e.message, 'danger');
    }
}

// ==================== REGISTER ====================
async function doRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (!name || !email || !password) {
        showMsg('All fields are required', 'warning');
        return;
    }
    
    try {
        const res = await fetch(API + '/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, email, password})
        });
        const data = await res.json();
        
        if (data.success) {
            showMsg('Registered! Redirecting...', 'success');
            setTimeout(() => window.location.href = 'login.html', 1200);
        } else {
            showMsg(data.message || 'Registration failed', 'danger');
        }
    } catch (e) {
        showMsg('Error: ' + e.message, 'danger');
    }
}

// ==================== SEATS ====================
let selectedSeats = [];
let currentMovie = null;

async function initSeats() {
    loadNav();
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { window.location.href = 'index.html'; return; }
    
    try {
        currentMovie = await fetch(API + '/movies/' + id).then(r => r.json());
        document.getElementById('movieTitle').textContent = currentMovie.title;
        document.getElementById('priceTag').textContent = currentMovie.price;
        
        const bookedSeats = await fetch(API + '/booked-seats/' + id).then(r => r.json());
        
        const grid = document.getElementById('seatGrid');
        grid.innerHTML = '';
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 10; c++) {
                const seat = document.createElement('div');
                const seatId = String.fromCharCode(65 + r) + (c + 1);
                seat.className = 'seat';
                seat.textContent = seatId;
                
                if (bookedSeats.includes(seatId)) {
                    seat.classList.add('booked');
                    seat.onclick = () => alert('This seat is already booked!');
                } else {
                    seat.onclick = () => toggleSeat(seat);
                }
                grid.appendChild(seat);
            }
        }
    } catch (e) {
        console.error('initSeats error:', e);
    }
}

function toggleSeat(el) {
    if (el.classList.contains('booked')) return;
    el.classList.toggle('selected');
    const id = el.textContent;
    if (selectedSeats.includes(id))
        selectedSeats = selectedSeats.filter(s => s !== id);
    else
        selectedSeats.push(id);
    
    document.getElementById('selectedCount').textContent = selectedSeats.length;
    document.getElementById('total').textContent = selectedSeats.length * currentMovie.price;
}

// ==================== PAYMENT ====================
function proceedToPayment() {
    if (selectedSeats.length === 0) { alert('Select at least 1 seat'); return; }
    
    const params = new URLSearchParams({
        movieId: currentMovie.id,
        title: currentMovie.title,
        seats: selectedSeats.join(','),
        amount: selectedSeats.length * currentMovie.price
    });
    window.location.href = 'payment.html?' + params.toString();
}

async function initPayment() {
    loadNav();
    const params = new URLSearchParams(window.location.search);
    document.getElementById('payMovie').textContent = params.get('title') || '';
    document.getElementById('paySeats').textContent = params.get('seats') || '';
    document.getElementById('payAmount').textContent = params.get('amount') || '0';
    document.getElementById('payBtnAmt').textContent = params.get('amount') || '0';
}

async function processPayment() {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('movieId');
    const seats = params.get('seats');
    const amount = params.get('amount');
    
    const btn = document.getElementById('payBtn');
    btn.disabled = true;
    btn.innerHTML = '⏳ Processing...';
    
    setTimeout(async () => {
        try {
            const res = await fetch(API + '/book', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    movieId: parseInt(movieId),
                    seats: seats,
                    amount: parseInt(amount)
                })
            }).then(r => r.json());
            
            if (res.success) {
                document.querySelector('.card').innerHTML = `
                    <div class="text-center">
                        <div style="font-size: 80px;">✅</div>
                        <h2 class="text-success">Payment Successful!</h2>
                        <p class="text-muted">Booking confirmed</p>
                        <hr>
                        <p><strong>Seats:</strong> ${seats}</p>
                        <p><strong>Amount:</strong> ₹${amount}</p>
                        <p><strong>Booking ID:</strong> #${Date.now().toString().slice(-6)}</p>
                        <hr>
                        <a href="mybookings.html" class="btn btn-primary">View My Bookings</a>
                        <a href="theaters.html" class="btn btn-outline-secondary">Back to Home</a>
                    </div>
                `;
            } else {
                alert('❌ ' + res.message);
                btn.disabled = false;
                btn.innerHTML = 'Pay ₹' + amount;
            }
        } catch (e) {
            alert('Payment failed. Try again.');
            btn.disabled = false;
            btn.innerHTML = 'Pay ₹' + amount;
        }
    }, 2000);
}

// ==================== MY BOOKINGS ====================
async function loadMyBookings() {
    loadNav();
    try {
        const list = await fetch(API + '/mybookings').then(r => r.json());
        const tbody = document.getElementById('bookingList');
        if (!tbody) return;
        
        if (!list || list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">No bookings yet</td></tr>`;
            return;
        }
        tbody.innerHTML = list.map(b => `
            <tr>
                <td>${b.title}</td>
                <td>${b.seats}</td>
                <td>₹${b.amount}</td>
                <td>${b.date}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('loadMyBookings error:', e);
    }
}

// ==================== ADMIN ====================
async function loadAdminMovies() {
    loadNav();
    try {
        const movies = await fetch(API + '/movies').then(r => r.json());
        const tbody = document.getElementById('adminMovieList');
        if (!tbody) return;
        
        tbody.innerHTML = movies.map(m => `
            <tr>
                <td>${m.id}</td>
                <td>${m.title}</td>
                <td>${m.show_time}</td>
                <td>₹${m.price}</td>
                <td>${m.theater_id || 1}</td>
                <td><button class="btn btn-sm btn-danger" onclick="deleteMovie(${m.id})">Delete</button></td>
            </tr>
        `).join('');
    } catch (e) {
        console.error('loadAdminMovies error:', e);
    }
}

async function addMovie() {
    const movie = {
        title: document.getElementById('mTitle').value,
        poster_url: document.getElementById('mPoster').value,
        show_time: document.getElementById('mTime').value,
        price: parseInt(document.getElementById('mPrice').value),
        theater_id: parseInt(document.getElementById('mTheater')?.value || 1)
    };
    
    if (!movie.title || !movie.show_time || !movie.price) {
        alert('Title, Time, and Price are required');
        return;
    }
    
    try {
        const res = await fetch(API + '/movies', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(movie)
        }).then(r => r.json());
        
        if (res.success) {
            alert('Movie added!');
            location.reload();
        } else {
            alert(res.message);
        }
    } catch (e) {
        alert('Error adding movie');
    }
}

async function deleteMovie(id) {
    if (!confirm('Delete this movie?')) return;
    try {
        await fetch(API + '/movies/' + id, {method: 'DELETE'});
        loadAdminMovies();
    } catch (e) {
        console.error('deleteMovie error:', e);
    }
}