package com.example.movie_ticket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.*;

@RestController
@RequestMapping("/api")
public class MainController {

    @Autowired UserRepository userRepo;
    @Autowired MovieRepository movieRepo;
    @Autowired BookingRepository bookingRepo;
    @Autowired TheaterRepository theaterRepo;

    // ==================== AUTH ====================
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User u) {
        Map<String, Object> res = new HashMap<>();
        if (userRepo.findByEmail(u.email) != null) {
            res.put("success", false);
            res.put("message", "Email already exists");
            return res;
        }
        userRepo.save(u);
        res.put("success", true);
        res.put("message", "Registered! Please login");
        return res;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User u, HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        User found = userRepo.findByEmailAndPassword(u.email, u.password);
        if (found == null) {
            res.put("success", false);
            res.put("message", "Invalid credentials");
            return res;
        }
        session.setAttribute("userId", found.id);
        session.setAttribute("userName", found.name);
        session.setAttribute("role", found.role);
        res.put("success", true);
        res.put("role", found.role);
        res.put("name", found.name);
        return res;
    }

    @GetMapping("/logout")
    public Map<String, Object> logout(HttpSession session) {
        session.invalidate();
        return Map.of("success", true);
    }

    @GetMapping("/me")
    public Map<String, Object> me(HttpSession session) {
        Map<String, Object> res = new HashMap<>();
        if (session.getAttribute("userId") == null) {
            res.put("loggedIn", false);
        } else {
            res.put("loggedIn", true);
            res.put("name", session.getAttribute("userName"));
            res.put("role", session.getAttribute("role"));
        }
        return res;
    }

    // ==================== THEATERS ====================
    @GetMapping("/theaters")
    public List<Theater> getAllTheaters() {
        return theaterRepo.findAll();
    }

    @GetMapping("/theaters/city/{city}")
    public List<Theater> getTheatersByCity(@PathVariable String city) {
        return theaterRepo.findByCity(city);
    }

    // ==================== MOVIES ====================
    @GetMapping("/movies")
    public List<Movie> getAllMovies() {
        return movieRepo.findAll();
    }

    @GetMapping("/movies/{id}")
    public Movie getMovie(@PathVariable Integer id) {
        return movieRepo.findById(id).orElse(null);
    }

    @GetMapping("/movies/theater/{theaterId}")
    public List<Movie> getMoviesByTheater(@PathVariable Integer theaterId) {
        return movieRepo.findByTheaterId(theaterId);
    }

    @PostMapping("/movies")
    public Map<String, Object> addMovie(@RequestBody Movie m, HttpSession session) {
        if (!"admin".equals(session.getAttribute("role")))
            return Map.of("success", false, "message", "Admin only");
        movieRepo.save(m);
        return Map.of("success", true);
    }

    @DeleteMapping("/movies/{id}")
    public Map<String, Object> deleteMovie(@PathVariable Integer id, HttpSession session) {
        if (!"admin".equals(session.getAttribute("role")))
            return Map.of("success", false, "message", "Admin only");
        movieRepo.deleteById(id);
        return Map.of("success", true);
    }

    // ==================== BOOKINGS ====================
    @PostMapping("/book")
    public Map<String, Object> book(@RequestBody Map<String, Object> data, HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null)
            return Map.of("success", false, "message", "Please login first");

        Booking b = new Booking();
        b.user_id = userId;
        b.movie_id = (Integer) data.get("movieId");
        b.seats = (String) data.get("seats");
        b.total_amount = (Integer) data.get("amount");
        bookingRepo.save(b);
        return Map.of("success", true, "message", "Booking confirmed!");
    }

    @GetMapping("/mybookings")
    public List<Map<String, Object>> myBookings(HttpSession session) {
        Integer userId = (Integer) session.getAttribute("userId");
        if (userId == null) return List.of();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Booking b : bookingRepo.findByUser_id(userId)) {
            Movie m = movieRepo.findById(b.movie_id).orElse(null);
            Map<String, Object> row = new HashMap<>();
            row.put("title", m != null ? m.title : "Unknown");
            row.put("seats", b.seats);
            row.put("amount", b.total_amount);
            row.put("date", b.booking_date.toString());
            result.add(row);
        }
        return result;
    }

    @GetMapping("/allbookings")
    public List<Booking> allBookings(HttpSession session) {
        if (!"admin".equals(session.getAttribute("role"))) return List.of();
        return bookingRepo.findAll();
    }

    @GetMapping("/booked-seats/{movieId}")
    public List<String> getBookedSeats(@PathVariable Integer movieId) {
        List<String> bookedSeats = new ArrayList<>();
        for (Booking b : bookingRepo.findByMovieId(movieId)) {
            if (b.seats != null) {
                for (String s : b.seats.split(",")) {
                    bookedSeats.add(s.trim());
                }
            }
        }
        return bookedSeats;
    }
}