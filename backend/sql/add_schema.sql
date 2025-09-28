CREATE TABLE component (
    component_id SERIAL,
    route VARCHAR(255) NOT NULL,
    method VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    children INT[],
    PRIMARY KEY (component_id)
);

CREATE TABLE service (
    service_id SERIAL,
    parent_component INT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (service_id),
    FOREIGN KEY (parent_component) REFERENCES component
);

CREATE TABLE DBschema (
    service_id INT,
    table_name VARCHAR(255),
    attributes JSON,
    FOREIGN KEY (service_id) REFERENCES service
);

CREATE TABLE userDB (
    conn VARCHAR(255),
    port INT
);