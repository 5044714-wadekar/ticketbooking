package com.example.movie_ticket;

import jakarta.persistence.*;

@Entity
@Table(name = "movies")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer id;
    public String title;
    public String poster_url;
    public String show_time;
    public Integer price;
    public Integer total_seats = 50;
    public Integer theater_id = 1;
}