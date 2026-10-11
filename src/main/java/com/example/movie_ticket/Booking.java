package com.example.movie_ticket;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    public Integer user_id;
    public Integer movie_id;
    public String seats;
    public Integer total_amount;
    public LocalDateTime booking_date = LocalDateTime.now();
}