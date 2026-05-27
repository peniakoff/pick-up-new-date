# PickUpNewDate

The calendar. It's not complicated. It has to be simple. That's all.

The simple project of calendar written in JavaScript, CSS and HTML. It's also (potentially) Google Material styled. The calendar supports English, Polish and German.
It supports keyboard navigation with left/right arrows, multiple calendar instances on one page and an optional date selection callback.

~Running example of this calendar you can see here: http://tomaszmiller.pl/PickUpNewDate~

<strong>If you have any questions or suggestions - look at my GitHub account and contact me!</strong>

## Usage

```html
<div id="calendar"></div>
<script src="calendar.js"></script>
<script>
    pickUpNewDate("eng", "calendar", {
        onDateSelect: function (date) {
            console.log(date.toISOString());
        }
    });
</script>
```

Supported languages:
- `eng`
- `pl`
- `de`

## Testing

There is no build step for this project.

Run the automated tests with:

```bash
node --test
```
