FROM golang:1.23-alpine3.20 AS build-stage
# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. 
RUN go mod download

# Copy the source code into the container
COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /dockerEmail .

# Run the tests in the container
FROM build-stage AS run-test-stage
RUN go test -v ./...

################################

# Start from scratch for the final image
FROM scratch AS final-stage

WORKDIR /app

COPY --from=build-stage /dockerEmail /dockerEmail

# EXPOSE 8080

#USER nonroot:nonroot

ENTRYPOINT ["/dockerEmail"]



