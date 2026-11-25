package com.example.watchlog.controller;

import com.example.watchlog.service.MovieReportService;
import net.sf.jasperreports.engine.JRException;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final MovieReportService reportService;

    public ReportController(MovieReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/movies/pdf")
    public ResponseEntity<byte[]> moviesPdf() throws JRException {
        byte[] pdf = reportService.generatePdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=watchlist.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
