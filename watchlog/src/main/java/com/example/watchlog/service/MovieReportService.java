package com.example.watchlog.service;

import com.example.watchlog.repository.MovieRepository;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class MovieReportService {

    private final MovieRepository movieRepository;
    private final JasperReport jasperReport;

    public MovieReportService(MovieRepository movieRepository) throws JRException, IOException {
        this.movieRepository = movieRepository;
        // template dikompilasi sekali saja saat aplikasi start
        try (InputStream in = new ClassPathResource("reports/movie_report.jrxml").getInputStream()) {
            this.jasperReport = JasperCompileManager.compileReport(in);
        }
    }

    public byte[] generatePdf() throws JRException {
        JRBeanCollectionDataSource dataSource =
                new JRBeanCollectionDataSource(movieRepository.findAll());

        Map<String, Object> params = new HashMap<>();
        params.put("title", "Daftar Watchlist Film");

        JasperPrint print = JasperFillManager.fillReport(jasperReport, params, dataSource);
        return JasperExportManager.exportReportToPdf(print);
    }
}