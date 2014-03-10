package io.hawt.introspect.dummy;

import io.hawt.example.dozer.dto.CustomerDTO;

import java.util.Date;

public class Invoice {
    private double value;
    private Date orderDate;
    private CustomerDTO customer;

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public CustomerDTO getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDTO customer) {
        this.customer = customer;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }
}
