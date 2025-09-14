import subprocess
import sys
import os


def run_spark_job():
    """
    Exécute le job Spark "Datacleaning.py" dans le conteneur Docker "spark-master".

    Cette fonction utilise 'subprocess.run' pour lancer une commande 'docker exec'
    qui soumet le job Spark. La commande est configurée pour:
    - S'exécuter en tant qu'utilisateur 'root' pour éviter les problèmes de permissions.
    - Utiliser le mode 'local[*]' pour le développement sur un seul nœud.
    - Télécharger la dépendance pour Kafka ('spark-sql-kafka-0-10_2.12:3.5.0').
    - Lancer le script Python situé dans le volume de travail de Spark.

    En cas d'échec de la commande, le script s'arrête et renvoie un code d'erreur.
    """
    print("🔥 Lancement du job Spark Datacleaning.py dans le conteneur Spark...")
    try:
        subprocess.run(
            [
                "docker",
                "exec",
                "--user",
                "root",
                "spark-master",
                "/opt/bitnami/spark/bin/spark-submit",
                "--master",
                "local[*]",
                "--conf",
                "spark.jars.ivy=/tmp/.ivy2",
                "--packages",
                "org.apache.spark:spark-sql-kafka-0-10_2.12:3.5.0",
                "/opt/bitnami/spark/work/Datacleaning.py",
            ],
            check=True,
        )
        print("✅ Le job Spark s'est terminé avec succès.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors de l'exécution du job Spark : {e}")
        # Arrête le script avec un code d'erreur
        sys.exit(1)
    except FileNotFoundError:
        print(
            "❌ Erreur : La commande 'docker' n'a pas été trouvée. Assurez-vous que Docker est installé et dans votre PATH."
        )
        sys.exit(1)
    except Exception as e:
        print(f"❌ Une erreur inattendue est survenue : {e}")
        sys.exit(1)


if __name__ == "__main__":
    """
    Point d'entrée du script.
    """
    print("✨ Démarrage du script pour exécuter le job Spark...")
    run_spark_job()
    print("➡️ Le script d'exécution a terminé son travail.")
