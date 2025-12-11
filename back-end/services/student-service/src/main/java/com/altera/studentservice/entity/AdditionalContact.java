package com.altera.studentservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class AdditionalContact {

    @Column(name = "additional_contact_name")
    private String name;

    @Column(name = "additional_contact_address")
    private String address;

    @Column(name = "additional_contact_phone")
    private String contactNumber;

    @Column(name = "additional_contact_relationship")
    private String relationship;

    public AdditionalContact() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }
}
