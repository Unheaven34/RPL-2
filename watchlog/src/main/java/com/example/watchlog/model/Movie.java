package com.example.watchlog.model;

import jakarta.persistence.*;

@Entity
@Table(name = "watchlist")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String movieTitle;
    private String moviePoster;
    private String status;
    private int userRating;

    // Getter dan Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }
    public String getMoviePoster() { return moviePoster; }
    public void setMoviePoster(String moviePoster) { this.moviePoster = moviePoster; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getUserRating() { return userRating; }
    public void setUserRating(int userRating) { this.userRating = userRating; }
}