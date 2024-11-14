package main

import (
	"testing"
	"github.com/wagslane/go-rabbitmq"
)


func TestEmail(t *testing.t) {
	
	conn, err := createRabbitmqconn(rabbitmqHost)
	if err != nil {
		t.Fatal(err)
	}
	defer conn.Close()

	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPass)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	
	
	go consumer(conn, d)


	publisher, err := rabbitmq.NewPublisher(
		conn,
		rabbitmq.WithPublisherOptionsLogging,
		rabbitmq.WithPublisherOptionsExchangeName(EmailExchange),
		rabbitmq.WithPublisherOptionsExchangeDeclare,
	)
	if err != nil {
		t.Fatal(err)
	}
	defer publisher.Close()
	

	RawJson :=`
	{
		"type": "email",
		"version": 1,
		"data": { "to": "test@test.com", "body": "You have been arrested by the Fbi. plz send us amazon gift cards for this to go away :)" }
	}
	`

	err = publisher.Publish(
		[]byte(RawJson),
		[]string{EmailRoute},
		rabbitmq.WithPublishOptionsContentType("application/json"),
		rabbitmq.WithPublishOptionsExchange(EmailExchange),
	)

	if err != nil {
		t.Fatal(err)
	}
}

func TestSendMail(t *testing.T) {

	const (
		//rabbitmqHost = "amqp://guest:guest@localhost"
		smtpHost = "localhost"
		smtpPort = 1025
		smtpUser = "user"
		smtpPass = "123456"
	)

	// publisher()
	//conn, err := createRabbitmqconn(rabbitmqHost)
	//if err != nil {
	//	log.Fatal(err)
	//}
	
	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPass)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	
	err = sendVerifyEmail(d, "joemama@joemama.com", "Hej")
	if err != nil {
		t.Errorf("lul %v", err)
	}
	
	
}