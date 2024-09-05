build:
	docker-compose build

up: 
	docker-compose up --build


stop:
	docker stop nginx redis django

fclean:	stop
	docker image rm nginx:latest redis:alpine django:latest -f
	docker system prune -f

re:	fclean up

.PHONY:	build stop re fclean up
