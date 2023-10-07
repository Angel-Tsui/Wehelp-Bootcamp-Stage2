import mysql.connector

con=mysql.connector.connect(
    user="root",
    password="",
    host="localhost",
    database="tp1"
)

cursor=con.cursor()
cursor.execute('''CREATE TABLE orders(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    booking_id BIGINT NOT NULL,
    order_number VARCHAR(70) NOT NULL,
    payment_status INT NOT NULL DEFAULT 1,
    UNIQUE(booking_id)
    )'''
)
con.commit()
print("orders table created")
cursor.close()
con.close()
print("connection closed")