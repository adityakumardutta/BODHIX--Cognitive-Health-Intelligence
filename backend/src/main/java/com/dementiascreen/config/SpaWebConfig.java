package com.dementiascreen.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * SPA fallback for the single-deployment (React UI + Spring Boot API in ONE
 * process) configuration.
 *
 * The React/Vite build is embedded in classpath:/static by the root Dockerfile.
 * Spring Boot already serves real static files (/, /index.html, /assets/**,
 * /favicon.png, ...) from there; this configuration ONLY adds the fallback so
 * client-side routes such as /login, /dashboard, /persons/:id,
 * /screening/:personId/run, ... return index.html instead of 404.
 *
 * Never intercepted:
 *   - /api/**            -> handled exclusively by REST controllers (404 stays 404)
 *   - any existing file  -> served as-is (assets, favicon, images, ...)
 *   - extension requests -> missing file returns 404, not index.html
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);

                        // 1. Real static file wins (assets, favicon, images, ...)
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }

                        // 2. Never shadow the API or any extension-bearing path
                        //    (missing asset -> honest 404, not the SPA shell)
                        if (resourcePath.startsWith("api/") || resourcePath.contains(".")) {
                            return null;
                        }

                        // 3. SPA deep link -> serve the React app shell
                        Resource index = new ClassPathResource("/static/index.html");
                        return index.exists() ? index : null;
                    }
                });
    }
}
