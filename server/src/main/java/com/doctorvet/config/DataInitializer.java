package com.doctorvet.config;

import com.doctorvet.model.*;
import com.doctorvet.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(
            DoctorProfileRepository doctorRepo,
            ClinicalCaseRepository caseRepo,
            PostRepository postRepo,
            ShortVideoRepository videoRepo,
            DoctorConnectionRepository connectionRepo,
            ConversationRepository convRepo,
            MessageRepository msgRepo
    ) {
        return args -> {
            if (doctorRepo.count() == 0) {
                // Seed Doctors with official demo credentials and specialties
                DoctorProfile ananya = new DoctorProfile("Dr. Ananya Sharma", "Small Animal Medicine", "BVSc & AH, MVSc (Medicine)",
                        "Bangalore Pet Hospital & Critical Care", "Bengaluru", "Karnataka",
                        "https://images.unsplash.com/photo-1594824813575-5858e94a5392?auto=format&fit=crop&w=300&q=80",
                        true, 8, 34, "Internal veterinary medicine, canine endocrinology, and critical emergency triage.");
                ananya.setEmail("ananya.sharma@doctorvet.com");

                DoctorProfile arjun = new DoctorProfile("Dr. Arjun Mehta", "Veterinary Surgery", "BVSc, MVSc (Surgery & Radiology)",
                        "MetroVet Super Specialty Hospital, Bandra", "Mumbai", "Maharashtra",
                        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
                        true, 12, 89, "Soft tissue reconstructive surgery and minimally invasive laparoscopy.");
                arjun.setEmail("arjun.mehta@doctorvet.com");

                DoctorProfile priya = new DoctorProfile("Dr. Priya Nair", "Veterinary Dermatology", "BVSc & AH, PhD (Dermatology)",
                        "Cochin Animal Allergy & Skin Clinic", "Kochi", "Kerala",
                        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
                        true, 10, 45, "Chronic atopic dermatitis management, intradermal testing, and autoimmune skin conditions.");
                priya.setEmail("priya.nair@doctorvet.com");

                DoctorProfile vikram = new DoctorProfile("Dr. Vikram Singh", "Equine Medicine", "BVSc & AH, MVSc (Equine Sports)",
                        "Royal Rajasthan Stud & Equine Clinic", "Jaipur", "Rajasthan",
                        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80",
                        true, 15, 62, "Thoroughbred orthopedics, colic management, and performance horse rehabilitation.");
                vikram.setEmail("vikram.singh@doctorvet.com");

                DoctorProfile sneha = new DoctorProfile("Dr. Sneha Reddy", "Avian Medicine", "BVSc & AH, MVSc (Avian Pathology)",
                        "Deccan Avian & Exotic Wildlife Hospital", "Hyderabad", "Telangana",
                        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
                        true, 7, 24, "Avian endoscopy, psittacine orthopedic pinning, and raptor surgery.");
                sneha.setEmail("sneha.reddy@doctorvet.com");

                DoctorProfile rahul = new DoctorProfile("Dr. Rahul Desai", "Internal Medicine", "BVSc & AH, MVSc (Internal Medicine)",
                        "West Coast Veterinary Specialty Center", "Pune", "Maharashtra",
                        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80",
                        true, 11, 48, "Canine gastroenterology, feline nephrology, and ultrasound guided biopsies.");
                rahul.setEmail("rahul.desai@doctorvet.com");

                DoctorProfile kavita = new DoctorProfile("Dr. Kavita Iyer", "Exotic Pets", "BVSc & AH, MVSc (Exotics)",
                        "Chennai Zoological & Exotic Clinic", "Chennai", "Tamil Nadu",
                        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=300&q=80",
                        true, 6, 31, "Reptilian metabolic bone disease and small mammal dental pathology.");
                kavita.setEmail("kavita.iyer@doctorvet.com");

                doctorRepo.saveAll(List.of(ananya, arjun, priya, vikram, sneha, rahul, kavita));
            }

            if (connectionRepo.count() == 0) {
                DoctorProfile ananya = doctorRepo.findAll().stream().filter(d -> d.getName().contains("Ananya")).findFirst().orElse(null);
                DoctorProfile arjun = doctorRepo.findAll().stream().filter(d -> d.getName().contains("Arjun")).findFirst().orElse(null);
                DoctorProfile priya = doctorRepo.findAll().stream().filter(d -> d.getName().contains("Priya")).findFirst().orElse(null);
                DoctorProfile vikram = doctorRepo.findAll().stream().filter(d -> d.getName().contains("Vikram")).findFirst().orElse(null);
                DoctorProfile sneha = doctorRepo.findAll().stream().filter(d -> d.getName().contains("Sneha")).findFirst().orElse(null);
                DoctorProfile rahul = doctorRepo.findAll().stream().filter(d -> d.getName().contains("Rahul")).findFirst().orElse(null);
                DoctorProfile kavita = doctorRepo.findAll().stream().filter(d -> d.getName().contains("Kavita")).findFirst().orElse(null);

                if (arjun != null && ananya != null) {
                    connectionRepo.saveAll(List.of(
                            new DoctorConnection(arjun.getId(), ananya.getId()),
                            new DoctorConnection(arjun.getId(), priya != null ? priya.getId() : ananya.getId()),
                            new DoctorConnection(arjun.getId(), vikram != null ? vikram.getId() : ananya.getId()),
                            new DoctorConnection(arjun.getId(), sneha != null ? sneha.getId() : ananya.getId()),
                            new DoctorConnection(arjun.getId(), rahul != null ? rahul.getId() : ananya.getId()),
                            new DoctorConnection(arjun.getId(), kavita != null ? kavita.getId() : ananya.getId()),
                            new DoctorConnection(ananya.getId(), priya != null ? priya.getId() : arjun.getId()),
                            new DoctorConnection(ananya.getId(), vikram != null ? vikram.getId() : arjun.getId())
                    ));
                }
            }

            if (convRepo.count() == 0) {
                DoctorProfile ananya = doctorRepo.findAll().stream().filter(d -> d.getName().contains("Ananya")).findFirst().orElse(null);
                DoctorProfile arjun = doctorRepo.findAll().stream().filter(d -> d.getName().contains("Arjun")).findFirst().orElse(null);

                if (arjun != null && ananya != null) {
                    Conversation conv1 = new Conversation(arjun.getId(), ananya.getId(), arjun.getName(), ananya.getName(),
                            arjun.getAvatar(), ananya.getAvatar());
                    conv1.setLastMessage("Thank you for the echo interpretation! The DCM patient is now stabilized on Pimobendan.");
                    conv1.setLastMessageSenderId(ananya.getId());
                    conv1.setUpdatedAt(LocalDateTime.now());
                    Conversation savedConv = convRepo.save(conv1);

                    msgRepo.saveAll(List.of(
                            new Message(savedConv.getId(), arjun.getId(), ananya.getId(), "Hi Dr. Ananya, did you get a chance to review the ECG recording I sent for Bruno?", null, null),
                            new Message(savedConv.getId(), ananya.getId(), arjun.getId(), "Yes! Fast atrial fibrillation with variable R-R intervals. I recommend starting diltiazem at 0.5 mg/kg PO TID alongside pimobendan.", null, null),
                            new Message(savedConv.getId(), arjun.getId(), ananya.getId(), "Will initiate right away and monitor blood pressure.", null, null),
                            new Message(savedConv.getId(), ananya.getId(), arjun.getId(), "Thank you for the echo interpretation! The DCM patient is now stabilized on Pimobendan.", null, null)
                    ));
                }
            }


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
                    new Post("Dr. Sneha Reddy", "Avian Medicine", "Hyderabad",
                            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
                            "CLINICAL_CASE", "CASE REPORT · AVIAN SURGERY",
                            "Avian tibiotarsal fracture repair using external skeletal fixation on an injured rescue Brahminy Kite. Callus formation confirmed at week 3 post-op.",
                            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
                            "Avian", 84),

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
