echo "Stopping Docu-Guardian infrastructure..."

echo "Stopping gateway..."
(cd nginx && docker compose down)

echo "Stopping monitoring..."
(cd prometheus && docker compose down)

echo "Stopping cache..."
(cd cache && docker compose down)

echo "Stopping Postgres..."
(cd postgres && docker compose down)

echo "All services stopped!"
