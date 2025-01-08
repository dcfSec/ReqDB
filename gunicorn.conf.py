# Gunicorn configuration file
import multiprocessing

accesslog = "-"
errorlog = "-"

bind = "0.0.0.0:8000"

worker_class = "gthread"
workers = (multiprocessing.cpu_count() * 2) + 1
threads = workers
