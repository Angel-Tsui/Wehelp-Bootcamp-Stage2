import mysql.connector

con=mysql.connector.connect(
    user="root",
    password="",
    host="localhost",
    database="tp1"
)

cursor=con.cursor()
cursor.execute('''CREATE TABLE booking(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    off_id VARCHAR(255) NOT NULL,
    date VARCHAR(255) NOT NULL,
    time VARCHAR(255) NOT NULL,
    price VARCHAR(255) NOT NULL,
    FOREIGN KEY(user_id) REFERENCES user(id)
)''')
con.commit()
print("booking Table created")
cursor.close()
con.close()
print("connection closed")