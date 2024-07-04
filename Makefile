DOCKER_EXEC= docker exec -it

all:
	docker-compose up -d --build

stop:
	docker-compose stop

clean: stop
	docker-compose down --rmi all

# exemplo: make exec c=container_name exec="ls -la"
log:
	docker logs -f $(c)

exec:
	$(DOCKER_EXEC) $(c) $(exec)

create_service:
	@if [ -z "$(name)" ]; then \
		echo "Usage: make create_service name=<service-name>"; \
	else \
		./setup_service.sh $(name); \
	fi

migration:
	docker run -it --rm -v "./backend/$(c)":/app -w /app python:3.9-slim /bin/bash -c "pip install --upgrade pip && pip install -r requirements.txt && python3 manage.py makemigrations ${c}_app && python3 manage.py migrate ${c}_app"


re: clean all

.PHONY: all clean create_service log exec
