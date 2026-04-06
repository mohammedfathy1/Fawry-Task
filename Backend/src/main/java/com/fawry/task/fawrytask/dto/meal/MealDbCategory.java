package com.fawry.task.fawrytask.dto.meal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MealDbCategory {

    @JsonProperty("idCategory")
    private String idCategory;

    @JsonProperty("strCategory")
    private String strCategory;

    @JsonProperty("strCategoryThumb")
    private String strCategoryThumb;

    @JsonProperty("strCategoryDescription")
    private String strCategoryDescription;
}

