package com.doctorvet.config;

import com.doctorvet.model.ClinicalCase;
import com.doctorvet.model.DoctorProfile;
import com.doctorvet.model.Post;
import com.doctorvet.model.ShortVideo;
import com.doctorvet.repository.ClinicalCaseRepository;
import com.doctorvet.repository.DoctorProfileRepository;
import com.doctorvet.repository.PostRepository;
import com.doctorvet.repository.ShortVideoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            DoctorProfileRepository doctorRepo,
            ClinicalCaseRepository caseRepo,
            PostRepository postRepo,
            ShortVideoRepository videoRepo
    ) {
        return args -> {
            if (doctorRepo.count() > 0) return;

            // Seed Doctors matching screenshots
            doctorRepo.saveAll(List.of(
                    new DoctorProfile("Dr. Ananya Sharma", "Small Animal Medicine", "BVSc & AH, MVSc (Medicine)",
                            "Bangalore Pet Hospital & Critical Care", "Bengaluru", "Karnataka",
                            "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80",
                            true, 8, 34, "Internal veterinary medicine, canine endocrinology, and critical emergency triage."),

                    new DoctorProfile("Dr. Arjun Mehta", "Veterinary Surgery", "BVSc, MVSc (Surgery & Radiology)",
                            "MetroVet Super Specialty Hospital, Bandra", "Mumbai", "Maharashtra",
                            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
                            true, 12, 89, "Soft tissue reconstructive surgery and minimally invasive laparoscopy."),

                    new DoctorProfile("Dr. Priya Nair", "Veterinary Dermatology", "BVSc & AH, PhD (Dermatology)",
                            "Cochin Animal Allergy & Skin Clinic", "Kochi", "Kerala",
                            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
                            true, 10, 45, "Chronic atopic dermatitis management, intradermal testing, and autoimmune skin conditions."),

                    new DoctorProfile("Dr. Vikram Singh", "Equine Medicine", "BVSc & AH, MVSc (Equine Sports)",
                            "Royal Rajasthan Stud & Equine Clinic", "Jaipur", "Rajasthan",
                            "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80",
                            true, 15, 62, "Thoroughbred orthopedics, colic management, and performance horse rehabilitation."),

                    new DoctorProfile("Dr. Tanya Bhatt", "Wildlife Medicine", "MVSc (Wildlife Health & Conservation)",
                            "Himalayan Wildlife Rescue Trust", "Dehradun", "Uttarakhand",
                            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
                            true, 9, 29, "Free-ranging mammal diagnostics, raptor rehabilitation, and zoonotic surveillance.")
            ));

            // Seed Clinical Cases
            caseRepo.saveAll(List.of(
                    new ClinicalCase("Acute Dilated Cardiomyopathy with Atrial Fibrillation in a Doberman Pinscher",
                            "Dr. Ananya Sharma", "Small Animal Cardiology", "Canine (Doberman, 6 yr, Male)",
                            "Acute syncope episode, exercise intolerance, tachypnea at rest for 48 hours.",
                            "Heart rate 190 bpm with pulse deficits. Gallop sound noted on auscultation. CRT 2.5s.",
                            "Echocardiogram: LVIDd 62mm, Fractional Shortening 11%. ECG confirmed fast atrial fibrillation.",
                            "Stage C Dilated Cardiomyopathy complicated by atrial fibrillation.",
                            "Pimobendan 0.25 mg/kg PO BID, Furosemide 1.5 mg/kg PO BID, Diltiazem 0.5 mg/kg PO TID.",
                            "Patient stabilized within 36 hours. Resting respiratory rate decreased to 22 bpm.",
                            "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80"),

                    new ClinicalCase("Strangulating Lipoma Causing Small Intestinal Volvulus in an Aged Marwari Stallion",
                            "Dr. Vikram Singh", "Equine Surgery", "Equine (Marwari, 18 yr, Stallion)",
                            "Severe unremitting colic unresponsive to flunixin meglumine. Pawing, sweating, violent recumbency.",
                            "Heart rate 78 bpm, toxic mucous membrane rings, absent borborygmi. 8 liters net reflux.",
                            "FLASH ultrasound confirmed amotile, distended small intestinal loops with thickened wall.",
                            "Strangulating pedunculated lipoma of jejunum requiring exploratory laparotomy.",
                            "Ventral midline laparotomy, enterectomy of 1.2m ischemic bowel, jejunojejunal anastomosis.",
                            "Discharged at Day 12 post-surgery. Full recovery to paddock turnout at Week 8.",
                            "https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80")
            ));

            // Seed Feed Posts
            postRepo.saveAll(List.of(
                    new Post("Dr. Tanya Bhatt", "Wildlife Medicine", "Dehradun",
                            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
                            "CLINICAL_CASE", "CASE REPORT · WILDLIFE TRIAGE",
                            "Sharing an unusual presentation: An adult rescued Himalayan Black Bear cub presented with acute unilateral corneal edema, hyphema, and lethargy following trauma. Slit lamp evaluation revealed superficial stromal ulceration without deep perforation. Initiated topical autologous serum drops and oral NSAID protocol.",
                            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
                            "Wildlife", 84),

                    new Post("Dr. Ananya Sharma", "Small Animal Medicine", "Bengaluru",
                            "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80",
                            "GENERAL_POST", "CLINICAL INSIGHT",
                            "Reminder for colleagues dealing with canine immune-mediated hemolytic anemia (IMHA): Don't overlook low-dose ultra-fractionated heparin alongside prednisolone when spherocytosis is prominent.",
                            null, "Canine", 128)
            ));

            // Seed Short Videos
            videoRepo.saveAll(List.of(
                    new ShortVideo("Rapid Subdermal Suture Pattern for Tension Relief",
                            "Dr. Arjun Mehta", "Surgery · Mumbai", "3.4k", "0:45",
                            "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=500&q=80", 412),

                    new ShortVideo("Identifying Comet-Tail Artifacts on Lung Ultrasound (TFAST)",
                            "Dr. Ananya Sharma", "Critical Care · Bengaluru", "5.8k", "0:58",
                            "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80", 670)
            ));
        };
    }
}
