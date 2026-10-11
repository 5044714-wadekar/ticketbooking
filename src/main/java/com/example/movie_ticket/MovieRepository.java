package com.example.movie_ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Integer> {

    @Query("SELECT m FROM Movie m WHERE m.theater_id = :theaterId")
    List<Movie> findByTheaterId(@Param("theaterId") Integer theaterId);
}