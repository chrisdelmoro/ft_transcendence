FROM rabbitmq:3-management

ENV RABBITMQ_USER root
ENV RABBITMQ_PASSWORD root
ENV RABBITMQ_PID_FILE /var/lib/rabbitmq/mnesia/rabbitmq

COPY init.sh /init.sh
RUN chmod +x /init.sh
EXPOSE 15672

CMD ["/init.sh"]