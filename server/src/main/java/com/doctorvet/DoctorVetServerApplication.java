package com.doctorvet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DoctorVetServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DoctorVetServerApplication.class, args);
	}

}
