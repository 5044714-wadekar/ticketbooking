package com.example.movie_ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {

    @Query("SELECT b FROM Booking b WHERE b.user_id = :userId")
    List<Booking> findByUser_id(@Param("userId") Integer userId);

    @Query("SELECT b FROM Booking b WHERE b.movie_id = :movieId")
    List<Booking> findByMovieId(@Param("movieId") Integer movieId);
}