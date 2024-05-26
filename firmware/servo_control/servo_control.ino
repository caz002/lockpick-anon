#include <Servo.h>

#define POTENTIOMETER_PIN A0
#define SERVO_PIN 10

Servo pickServo;

void setup() {
  // put your setup code here, to run once:
  pickServo.attach(SERVO_PIN);
  Serial.begin(115200);
  pinMode(POTENTIOMETER_PIN, INPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  int potVal = analogRead(POTENTIOMETER_PIN);
  int servoAngle = map(potVal, 0, 1023, 0, 60);
  Serial.println("potVal: " + String(potVal));
  Serial.println("servoAngle: " + String(servoAngle));

  pickServo.write(servoAngle);
}
