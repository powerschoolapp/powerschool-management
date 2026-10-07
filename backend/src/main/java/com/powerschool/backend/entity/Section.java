package com.powerschool.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "sections",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"school_class_id", "name"}
                )
        }
)
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "school_class_id", nullable = false)
    private SchoolClass schoolClass;

    public Section() {
    }

    public Section(String name, SchoolClass schoolClass) {
        this.name = name;
        this.schoolClass = schoolClass;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public SchoolClass getSchoolClass() {
        return schoolClass;
    }

    public void setSchoolClass(SchoolClass schoolClass) {
        this.schoolClass = schoolClass;
    }
}
