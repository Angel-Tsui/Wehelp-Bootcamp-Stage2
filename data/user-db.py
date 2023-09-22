import mysql.connector

con=mysql.connector.connect(
    user="root",
    password="",
    host="localhost",
    database="tp1"
)

cursor=con.cursor()
cursor.execute('''CREATE TABLE user(
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    UNIQUE(name, email)
)''')
con.commit()
print("user Table created")
cursor.close()
con.close()
print("connection closed")