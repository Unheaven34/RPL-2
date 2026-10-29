package com.example.watchlog.controller;

import com.example.watchlog.model.Movie;
import com.example.watchlog.repository.MovieRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class MovieController {

    private final MovieRepository movieRepository;

    public MovieController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    // READ semua
    @GetMapping
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // READ satu
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovie(@PathVariable Long id) {
        return movieRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE
    @PostMapping
    public ResponseEntity<?> addMovie(@RequestBody Movie movie) {
        String error = validate(movie);
        if (error != null) return ResponseEntity.badRequest().body(error);
        movie.setId(null); // pastikan selalu insert baru
        return ResponseEntity.status(201).body(movieRepository.save(movie));
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable Long id, @RequestBody Movie data) {
        String error = validate(data);
        if (error != null) return ResponseEntity.badRequest().body(error);
        return movieRepository.findById(id).map(movie -> {
            movie.setMovieTitle(data.getMovieTitle());
            movie.setMoviePoster(data.getMoviePoster());
            movie.setStatus(data.getStatus());
            movie.setUserRating(data.getUserRating());
            return ResponseEntity.ok((Object) movieRepository.save(movie));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        if (!movieRepository.existsById(id)) return ResponseEntity.notFound().build();
        movieRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String validate(Movie m) {
        if (m.getMovieTitle() == null || m.getMovieTitle().isBlank()) return "Judul wajib diisi";
        if (m.getUserRating() < 0 || m.getUserRating() > 5) return "Rating harus 0-5";
        return null;
    }
}